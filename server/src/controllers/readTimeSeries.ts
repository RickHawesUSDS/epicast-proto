import { isAfter, parseISO } from 'date-fns'
import { parse } from 'csv-string'
import { strict as assert } from 'node:assert'

import { FeedBucket, BucketObject } from '@/models/FeedBucket'
import { TIMESERIES_FOLDER } from '@/models/feedBucketKeys'
import { getLogger } from '@/utils/loggers'
import { MutableTimeSeries } from '../models/TimeSeries'
import { FeedElement } from '../models/FeedElement'
import { FeedSchema } from '@/models/FeedSchema'

const logger = getLogger('READ_TIME_SERIES_CONTROLLER')

export async function readTimeSeries<T> (fromBucket: FeedBucket, toTimeSeries: MutableTimeSeries<T>): Promise<void> {
  const reader = new TimeSeriesReader(fromBucket, toTimeSeries)
  await reader.read()
}

class TimeSeriesReader<T> {
  bucket: FeedBucket
  timeSeries: MutableTimeSeries<T>

  constructor (fromBucket: FeedBucket, toTimeSeries: MutableTimeSeries<T>) {
    this.bucket = fromBucket
    this.timeSeries = toTimeSeries
  }

  async read (): Promise<void> {
    logger.info(`Reading: ${this.bucket.name}`)
    let publishedObjects = await this.bucket.listObjects(TIMESERIES_FOLDER)
    const metadata = await this.timeSeries.fetchMetadata()
    if (metadata !== null) {
      publishedObjects = publishedObjects.filter((object) => isAfter(object.lastModified, metadata.lastUpdatedAt))
    }
    logger.debug(`${this.bucket.name} has ${publishedObjects.length} objects to read`)
    const events = await this.fetchEvents(publishedObjects)
    await this.timeSeries.upsertEvents(events)
  }

  async fetchEvents (publishedObjects: BucketObject[]): Promise<T[]> {
    const promises = publishedObjects.map(async (publishedObject) => await this.fetchOnePartition(publishedObject))
    const events = (await Promise.all(promises)).flatMap((partition) => partition)
    return events
  }

  async fetchOnePartition (publishedObject: BucketObject): Promise<T[]> {
    function matchElements (header: string[], schema: FeedSchema): FeedElement[] {
      const elements: FeedElement[] = []
      for (let col = 0; col < header.length; col++) {
        const name = header[col]
        const matchedElement = schema.elements.find((element) => element.name === name)
        if (matchedElement !== undefined) {
          elements.push(matchedElement)
        }
      }
      assert(header.length === elements.length)
      return elements
    }

    const csv = await this.bucket.getObject(publishedObject.key)
    const rows = parse(csv)
    if (rows.length === 0) throw new Error('invalid object')

    const elements = matchElements(rows[0], this.timeSeries.schema)
    return rows.slice(1).map((row) => this.readEvent(row, elements))
  }

  readEvent (row: string[], elements: FeedElement[]): T {
    assert(row.length === elements.length)
    const values = row.map((column, index) => {
      switch (elements[index].type) {
        case 'date': return parseISO(column)
        case 'number': return Number.parseFloat(column)
        default: return column
      }
    })
    const names = elements.map((element) => element.name)
    return this.timeSeries.createEvent(names, values)
  }
}
