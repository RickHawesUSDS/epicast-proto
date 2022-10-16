import { max as maxDate, isAfter, isWithinInterval, differenceInMonths, isFuture, endOfDay, formatISO } from 'date-fns'
import { stringify } from 'csv-string'
import pathPosix from 'node:path/posix'

import { Bucket, BucketObject } from '@/models/Bucket'
import { PublishLog } from './PublishLog'
import { getLogger } from '@/utils/loggers'
import { Period, Frequency } from '@/utils/Period'
import { TimeSeries, TimeSeriesEvent } from '../models/TimeSeries'
import { FeedElement } from '../models/FeedElement'

const TIMESERIES_FOLDER = 'time_series'
const DESIRED_MAX_PER_PERIOD = 10000
const CSV_EXT = 'csv'

const logger = getLogger('PUBLISH_TIME_SERIES_SERVICE')

export async function publishTimeseries(toBucket: Bucket, timeseries: TimeSeries, log: PublishLog): Promise<void> {
  logger.info(`publishing timeseries: ${timeseries.schema.organizationId}-${timeseries.schema.organizationId}`)
  const publisher = new TimeSeriesPublisher(toBucket, timeseries, log)
  await publisher.publish()
}

interface CasePartion {
  period: Period
  cases: TimeSeriesEvent[]
}

class TimeSeriesPublisher {
  bucket: Bucket
  timeseries: TimeSeries
  log: PublishLog

  constructor(toBucket: Bucket, timeseries: TimeSeries, log: PublishLog) {
    this.bucket = toBucket
    this.timeseries = timeseries
    this.log = log
  }

  async publish(): Promise<void> {
    await this.updatePublishedPartions()
    const lastReportedPeriod = await this.findLastPublishedPeriod()
    await this.publishNewPartitions(lastReportedPeriod)
  }

  async updatePublishedPartions(): Promise<void> {
    const publishedObjects = await this.bucket.listObjects(TIMESERIES_FOLDER)
    if (publishedObjects.length === 0) return // early shortcut
    const lastPublishDate = this.calcMaxLastModified(publishedObjects)

    for (const publishedObject of publishedObjects) {
      const period = this.periodFromObjectKey(publishedObject.key)
      const isPeriodUpdated = await this.hasUpdates(period, lastPublishDate)
      if (isPeriodUpdated) {
        const periodCases = await this.timeseries.findEvents({ interval: period.interval })
        if (period.frequency === Frequency.MONTHLY && periodCases.length > DESIRED_MAX_PER_PERIOD) {
          await this.replaceMonthlyWithDaily(period, periodCases)
        } else {
          await this.updatePartition(period, periodCases)
        }
      }
    }
  }

  async hasUpdates(period: Period, after?: Date): Promise<boolean> {
    let updatedEvents: number
    if (after !== undefined) {
      updatedEvents = await this.timeseries.countEvents({ interval: period.interval, updatedAfter: after })
    } else {
      updatedEvents = await this.timeseries.countEvents({ interval: period.interval })
    }
    return updatedEvents > 0
  }

  async updatePartition(period: Period, periodEvents: TimeSeriesEvent[]): Promise<void> {
    const key = this.objectKeyFromPeriod(period)
    await this.putPartition(key, periodEvents)
    this.log.update(key)
  }

  async replaceMonthlyWithDaily(publishedPeriod: Period, events: TimeSeriesEvent[]): Promise<void> {
    let endDate = publishedPeriod.end
    if (isFuture(publishedPeriod.end)) {
      const lastEventDate = this.lastEventDate(events) ?? new Date()
      endDate = endOfDay(maxDate([lastEventDate, new Date()]))
    }
    const partitions = this.makeCasePartions(events, publishedPeriod.start, endDate, Frequency.DAILY)
    const newKeys: string[] = []
    for (const partition of partitions) {
      const key = this.objectKeyFromPeriod(partition.period)
      await this.putPartition(key, partition.cases)
      newKeys.push(key)
    }
    const oldKey = this.objectKeyFromPeriod(publishedPeriod)
    await this.bucket.deleteObject(oldKey)
    this.log.replace(oldKey, newKeys)
  }

  async findLastPublishedPeriod(): Promise<Period | undefined> {
    const publishedObjects = await this.bucket.listObjects(TIMESERIES_FOLDER)
    return this.calcLastPeriod(publishedObjects)
  }

  async publishNewPartitions(lastPublishedPeriod: Period | undefined): Promise<void> {
    let events: TimeSeriesEvent[]
    let startDate: Date
    let endDate: Date
    let frequency: Frequency
    if (lastPublishedPeriod === undefined) {
      events = await this.timeseries.findEvents({})
      startDate = this.firstEventDate(events) ?? new Date()
      endDate = this.lastEventDate(events) ?? new Date()
      frequency = this.decideOnFrequency(events, Frequency.MONTHLY)
    } else {
      startDate = lastPublishedPeriod.nextPeriod().start
      events = await this.timeseries.findEvents({ after: startDate })
      if (events.length === 0) return // short cut the work
      endDate = this.lastEventDate(events) ?? new Date()
      frequency = this.decideOnFrequency(events, lastPublishedPeriod.frequency)
    }
    const partitions = this.makeCasePartions(events, startDate, endDate, frequency)
    for (const partition of partitions) {
      const key = this.objectKeyFromPeriod(partition.period)
      await this.putPartition(key, partition.cases)
      this.log.add(key)
    }
  }

  decideOnFrequency(events: TimeSeriesEvent[], lastFrequency: Frequency): Frequency {
    if (events.length === 0) return lastFrequency
    const months = differenceInMonths(this.firstEventDate(events) ?? new Date(), this.lastEventDate(events) ?? new Date())
    if (months === 0) return lastFrequency
    return events.length / months > DESIRED_MAX_PER_PERIOD ? Frequency.DAILY : lastFrequency
  }

  async putPartition(key: string, events: TimeSeriesEvent[]): Promise<void> {
    function formatValue(event: TimeSeriesEvent, element: FeedElement): string {
      let result: string
      switch (element.type) {
        case 'date': {
          const value = event.getValue(element.name) as Date
          result = formatISO(value)
          break
        }
        default: {
          result = event.getValue(element.name) as string ?? ''
          break
        }
      }
      return result
    }

    function createCSV(events: TimeSeriesEvent[], elements: FeedElement[]): string {
      const csv = events.map(event => {
        const values = elements.map(element => formatValue(event, element))
        return stringify(values)
      })
      csv.unshift(stringify(elements.map(element => element.name)))
      return csv.join('')
    }

    const report = createCSV(events, this.timeseries.schema.elements)
    await this.bucket.putObject(key, report)
  }

  makeCasePartions(events: TimeSeriesEvent[], startDate: Date, endDate: Date, frequency: Frequency): CasePartion[] {
    const partions: CasePartion[] = []
    let partitionPeriod = new Period(startDate, frequency)
    while (!isAfter(partitionPeriod.start, endDate)) {
      const partitionCases = this.findCasesForPeriod(events, partitionPeriod)
      partions.push({ period: partitionPeriod, cases: partitionCases })
      partitionPeriod = partitionPeriod.nextPeriod()
    }
    return partions
  }

  firstEventDate(events: TimeSeriesEvent[]): Date | undefined {
    return events.at(0)?.eventAt
  }

  lastEventDate(events: TimeSeriesEvent[]): Date | undefined {
    return events.at(-1)?.eventAt
  }

  findCasesForPeriod(events: TimeSeriesEvent[], period: Period): TimeSeriesEvent[] {
    return events.filter(event => { return isWithinInterval(event.eventAt, period.interval) })
  }

  periodFromObjectKey(key: string | undefined): Period {
    if (key === undefined) throw Error('Object key is undefined')
    const periodPart = pathPosix.parse(key).name
    return Period.parse(periodPart)
  }

  fileNameFromPeriod(period: Period): string {
    return `${period.toString()}.${CSV_EXT}`
  }

  objectKeyFromPeriod(period: Period): string {
    const fileName = this.fileNameFromPeriod(period)
    return `${TIMESERIES_FOLDER}/${fileName}`
  }

  calcMaxLastModified(objects: BucketObject[]): Date | undefined {
    if (objects.length === 0) return undefined
    const modifiedDates = objects.map((object) => { return object.lastModified })
    return maxDate(modifiedDates)
  }

  calcLastPeriod(publishedObjects: BucketObject[]): Period | undefined {
    if (publishedObjects.length === 0) return undefined
    let lastPeriod = this.periodFromObjectKey(publishedObjects.at(0)?.key)
    for (const publishedObject of publishedObjects) {
      const period = this.periodFromObjectKey(publishedObject.key)
      if (isAfter(period.start, lastPeriod.start)) {
        lastPeriod = period
      }
    }
    return lastPeriod
  }
}
