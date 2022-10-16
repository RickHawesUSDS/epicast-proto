import { max as maxDate, parseISO, isAfter, isWithinInterval, differenceInMonths, isFuture, endOfDay } from 'date-fns'
import { stringify } from 'csv-string'
import pathPosix from 'node:path/posix'

import { Bucket, BucketObject } from '@/models/Bucket'
import { FeedLog } from './FeedLog'
import { getLogger } from '@/utils/loggers'
import { Period, Frequency } from '@/utils/Period'
import { TimeSeries } from '../models/TimeSeries'
import { FeedElement } from "../models/FeedElement"

const TIMESERIES_FOLDER = 'time_series'
const DESIRED_MAX_PER_PERIOD = 10000
const CSV_EXT = 'csv'

const logger = getLogger('PUBLISH_TIME_SERIES_SERVICE')

export async function publishTimeseries<T>(toBucket: Bucket, timeseries: TimeSeries<T>, log: FeedLog): Promise<void> {
  logger.info(`publishing timeseries: ${typeof timeseries}`)
  const publisher = new TimeSeriesPublisher(toBucket, timeseries, log)
  await publisher.publish()
}

interface CasePartion<T> {
  period: Period
  cases: T[]
}

class TimeSeriesPublisher<T> {
  bucket: Bucket
  timeseries: TimeSeries<T>
  log: FeedLog

  constructor(toBucket: Bucket, timeseries: TimeSeries<T>, log: FeedLog) {
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

  async updatePartition(period: Period, periodEvents: T[]): Promise<void> {
    const key = this.objectKeyFromPeriod(period)
    await this.putPartition(key, periodEvents)
    this.log.update(key)
  }

  async replaceMonthlyWithDaily(publishedPeriod: Period, events: T[]): Promise<void> {
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
    let events: T[]
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

  decideOnFrequency(events: T[], lastFrequency: Frequency): Frequency {
    if (events.length === 0) return lastFrequency
    const months = differenceInMonths(this.firstEventDate(events) ?? new Date(), this.lastEventDate(events) ?? new Date())
    if (months === 0) return lastFrequency
    return events.length / months > DESIRED_MAX_PER_PERIOD ? Frequency.DAILY : lastFrequency
  }

  async putPartition(key: string, events: T[]): Promise<void> {
    function createCSV(events: T[], elements: FeedElement[]): string {
      const csv = events.map(event => {
        const values = elements.map(element => event[element.name as keyof T] as string ?? '')
        return stringify(values)
      })
      csv.unshift(stringify(elements.map(element => element.name)))
      return csv.join('')
    }

    const report = createCSV(events, this.timeseries.schema.elements)
    await this.bucket.putObject(key, report)
  }

  makeCasePartions(events: T[], startDate: Date, endDate: Date, frequency: Frequency): Array<CasePartion<T>> {
    const partions: Array<CasePartion<T>> = []
    let partitionPeriod = new Period(startDate, frequency)
    while (!isAfter(partitionPeriod.start, endDate)) {
      const partitionCases = this.findCasesForPeriod(events, partitionPeriod)
      partions.push({ period: partitionPeriod, cases: partitionCases })
      partitionPeriod = partitionPeriod.nextPeriod()
    }
    return partions
  }

  firstEventDate(events: T[]): Date | undefined {
    const event = events.at(0)
    return event !== undefined ? this.timeseries.getEventAt(event) : undefined
  }

  lastEventDate(events: T[]): Date | undefined {
    const event = events.at(-1)
    return event !== undefined ? this.timeseries.getEventAt(event) : undefined
  }

  findCasesForPeriod(events: T[], period: Period): T[] {
    return events.filter(event => { return isWithinInterval(this.timeseries.getEventAt(event), period.interval) })
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
