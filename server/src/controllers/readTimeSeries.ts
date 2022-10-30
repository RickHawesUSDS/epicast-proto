import { isAfter, min, parseISO } from 'date-fns'
import { parse } from 'csv-string'
import { strict as assert } from 'node:assert'

import { BucketObject } from '@/models/FeedBucket'
import { TIMESERIES_FOLDER } from '@/models/feedBucketKeys'
import { getLogger } from '@/utils/loggers'
import { MutableTimeSeries } from '../models/TimeSeries'
import { FeedElement } from '../models/FeedElement'
import { FeedSchema } from '@/models/FeedSchema'
import { Snapshot } from '@/models/Snapshot'

const logger = getLogger('READ_TIME_SERIES_CONTROLLER')

export async function readTimeSeries<T> (fromSnapshot: Snapshot, toTimeSeries: MutableTimeSeries<T>): Promise<Date | undefined> {
  const reader = new TimeSeriesReader(fromSnapshot, toTimeSeries)
  return await reader.read()
}

class TimeSeriesReader<T> {
  snapshot: Snapshot
  timeSeries: MutableTimeSeries<T>

  constructor (fromSnapshot: Snapshot, toTimeSeries: MutableTimeSeries<T>) {
    this.snapshot = fromSnapshot
    this.timeSeries = toTimeSeries
  }

  async read (): Promise<Date | undefined> {
    logger.info(`Reading: ${this.snapshot.name}`)
    let publishedObjects = await this.snapshot.listObjects(TIMESERIES_FOLDER)
    if (publishedObjects.length === 0) return
    const lastPublished = this.lastModifiedOf(publishedObjects)
    const metadata = await this.timeSeries.fetchMetadata()
    if (metadata !== null) {
      publishedObjects = publishedObjects.filter((object) => isAfter(object.lastModified, metadata.lastUpdatedAt))
    }
    logger.debug(`${this.snapshot.name} has ${publishedObjects.length} objects to read`)
    const events = await this.fetchEvents(publishedObjects)
    await this.timeSeries.upsertEvents(events)
    return lastPublished
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

    const csv = await this.snapshot.getObject(publishedObject.key)
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

  lastModifiedOf (objects: BucketObject[]): Date {
    return min(objects.map((o) => o.lastModified))
  }
}
