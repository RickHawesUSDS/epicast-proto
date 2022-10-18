import { isAfter, parseISO } from 'date-fns'
import CSV from 'csv-string'
import { strict as assert } from 'node:assert';

import { FeedBucket, BucketObject } from '@/models/FeedBucket'
import { TIMESERIES_FOLDER, } from "@/models/feedBucketKeys"
import { getLogger } from '@/utils/loggers'
import { TimeSeries, TimeSeriesMutator } from '../models/TimeSeries'
import { FeedElement } from '../models/FeedElement'
import { FeedSchema } from '@/models/FeedSchema'


const logger = getLogger('READ_TIME_SERIES_SERVICE')

export async function readTimeSeries<T>(fromBucket: FeedBucket, toTimeSeries: TimeSeries & TimeSeriesMutator<T>): Promise<void> {
  const reader = new TimeSeriesReader(fromBucket, toTimeSeries)
  await reader.read()
}

class TimeSeriesReader<T> {
  bucket: FeedBucket
  timeSeries: TimeSeries & TimeSeriesMutator<T>

  constructor(fromBucket: FeedBucket, toTimeSeries: TimeSeries & TimeSeriesMutator<T>) {
    this.bucket = fromBucket
    this.timeSeries = toTimeSeries
  }

  async read(): Promise<void> {
    logger.info('Reading: $0', this.bucket.name)
    let publishedObjects = await this.bucket.listObjects(TIMESERIES_FOLDER)
    const metadata = await this.timeSeries.fetchMetadata()
    if (metadata !== null) {
      logger.debug('Incremental update: $0', this.bucket.name)
      publishedObjects = publishedObjects.filter((object) => isAfter(object.lastModified, metadata.lastUpdatedAt))
    }
    const events = await this.fetchEvents(publishedObjects)
    await this.timeSeries.upsertEvents(events)
  }

  async fetchEvents(publishedObjects: BucketObject[]): Promise<T[]> {
    const promises = publishedObjects.map((publishedObject) => this.fetchOnePartition(publishedObject))
    const events = (await Promise.all(promises)).flatMap((partition) => partition)
    return events
  }

  async fetchOnePartition(publishedObject: BucketObject): Promise<T[]> {
    function matchElements(header: string[], schema: FeedSchema): Array<FeedElement> {
      let elements: FeedElement[] = []
      for (let col = 0; col < header.length; col++) {
        const name = header[col]
        const element = schema.elements.find((element) => element.name === name)
        if (element !== undefined) {
          elements.push(element)
        }
      }
      assert(header.length === elements.length)
      return elements
    }

    const csv = await this.bucket.getObject(publishedObject.key)
    const rows = CSV.parse(csv)
    if (rows.length === 0) throw new Error('invalid object')

    const elements = matchElements(rows[0], this.timeSeries.schema)
    return rows.slice(1).map((row) => this.readEvent(row, elements))
  }

  readEvent(row: string[], elements: Array<FeedElement>): T {
    assert(row.length === elements.length)
    const values = row.map((column, index) => {
      switch (elements[index].type) {
        case 'date': return parseISO(column)
        case 'number': return (new Number(column)).valueOf()
        default: return column
      }
    })
    const names = elements.map((element) => element.name)
    return this.timeSeries.createEvent(names, values)
  }
}


