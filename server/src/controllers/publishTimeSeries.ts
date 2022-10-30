import { max as maxDate, isAfter, isWithinInterval, formatISO, isFirstDayOfMonth, addDays, isBefore, startOfDay, differenceInDays, endOfDay } from 'date-fns'
import { stringify } from 'csv-string'

import { BucketObject } from '@/models/FeedBucket'
import { formTimeSeriesKey, periodFromTimeSeriesKey, TIMESERIES_FOLDER } from '@/models/feedBucketKeys'
import { getLogger } from '@/utils/loggers'
import { Period } from '@/utils/Period'
import { Frequency } from '@/utils/Frequency'
import { TimeSeries, TimeSeriesEvent, TimeSeriesFindOptions } from '../models/TimeSeries'
import { FeedElement, filterElements } from '../models/FeedElement'
import { assert } from 'console'
import { MutableSnapshot } from '@/models/Snapshot'

const DESIRED_MAX_MONTHLY_COUNT = 10000 / 30

const logger = getLogger('PUBLISH_TIME_SERIES_SERVICE')

export async function publishTimeseries<T> (toSnapshot: MutableSnapshot, timeseries: TimeSeries<T>): Promise<void> {
  logger.info(`publishing timeseries: ${timeseries.schema.organizationId}-${timeseries.schema.organizationId}`)
  const publisher = new TimeSeriesPublisher(toSnapshot, timeseries)
  await publisher.publish()
}

interface CasePartition<T> {
  period: Period
  cases: Array<TimeSeriesEvent<T>>
}

class TimeSeriesPublisher<T> {
  snapshot: MutableSnapshot
  timeseries: TimeSeries<T>

  constructor (toSnapshot: MutableSnapshot, timeseries: TimeSeries<T>) {
    this.snapshot = toSnapshot
    this.timeseries = timeseries
  }

  async publish (): Promise<void> {
    await this.updatePublishedPartions()
    await this.publishNewPartitions()
  }

  async updatePublishedPartions (): Promise<void> {
    const publishedObjects = await this.snapshot.listObjects(TIMESERIES_FOLDER)
    if (publishedObjects.length === 0) return // early shortcut
    const lastPublishDate = this.calcMaxLastModified(publishedObjects)

    for (const publishedObject of publishedObjects) {
      const period = periodFromTimeSeriesKey(publishedObject.key)
      const isPeriodUpdated = await this.hasUpdates(period, lastPublishDate)
      if (isPeriodUpdated) {
        const periodCases = await this.findEvents({ interval: period.interval })
        logger.debug(`updating partition: ${publishedObject.key} with ${periodCases.length} cases`)
        await this.updatePartition(period, periodCases)
      }
    }
  }

  async hasUpdates (period: Period, after?: Date): Promise<boolean> {
    let updatedEvents: number
    if (after !== undefined) {
      updatedEvents = await this.timeseries.countEvents({ interval: period.interval, updatedAfter: after })
    } else {
      updatedEvents = await this.timeseries.countEvents({ interval: period.interval })
    }
    return updatedEvents > 0
  }

  async updatePartition (period: Period, periodEvents: Array<TimeSeriesEvent<T>>): Promise<void> {
    const key = formTimeSeriesKey(period)
    await this.putPartition(key, periodEvents)
  }

  async findLastPublishedPeriod (): Promise<Period | undefined> {
    const publishedObjects = await this.snapshot.listObjects(TIMESERIES_FOLDER)
    return this.calcLastPeriod(publishedObjects)
  }

  async publishNewPartitions (): Promise<void> {
    let events: Array<TimeSeriesEvent<T>>
    let startDate: Date
    let endDate: Date
    // Get the events
    const lastPublishedPeriod = await this.findLastPublishedPeriod()
    if (lastPublishedPeriod === undefined) {
      events = await this.findEvents({})
      startDate = startOfDay(this.firstEventDate(events) ?? new Date())
      endDate = endOfDay(this.lastEventDate(events) ?? new Date())
    } else {
      startDate = lastPublishedPeriod.nextPeriod().start
      events = await this.findEvents({ after: startDate })
      endDate = endOfDay(this.lastEventDate(events) ?? new Date())
    }
    if (events.length === 0) return // short circuit
    const partitions = await this.makeRightSizedPartitions(events, startDate, endDate, lastPublishedPeriod)
    for (const partition of partitions) {
      const key = formTimeSeriesKey(partition.period)
      await this.putPartition(key, partition.cases)
    }
  }

  async makeRightSizedPartitions (events: Array<TimeSeriesEvent<T>>, startDate: Date, endDate: Date, lastPublishedPeriod?: Period): Promise<Array<CasePartition<T>>> {
    assert(isBefore(startDate, endDate), 'end before start date')
    assert(
      lastPublishedPeriod === undefined ||
      (lastPublishedPeriod.frequency === Frequency.MONTHLY && isFirstDayOfMonth(startDate)) ||
      lastPublishedPeriod.frequency === Frequency.DAILY,
      'expected new monthly updates to start on the first day of the month'
    )
    if (events.length === 0) return []

    // This code basically decides between daily and monthly partitions based on partition size.
    let partitions: Array<CasePartition<T>> = []
    const monthlyPartitions = this.makeCasePartions(events, startDate, endDate, Frequency.MONTHLY)
    // look at each monthly partition and decide if it is too large
    for (let index = 0; index < monthlyPartitions.length; index++) {
      const monthlyPartition = monthlyPartitions[index]
      let count
      if (index === 0) {
        count = await this.timeseries.countEvents({ after: startOfDay(addDays(monthlyPartition.period.end, -30)), before: monthlyPartition.period.end })
      } else {
        count = monthlyPartition.cases.length
      }
      const lengthOfPeriod = Math.min(differenceInDays(monthlyPartition.period.end, monthlyPartition.period.start), 1)
      if ((count / lengthOfPeriod) < DESIRED_MAX_MONTHLY_COUNT) {
        partitions = partitions.concat(monthlyPartition)
      } else {
        const dailyPartitions = this.makeCasePartions(events, monthlyPartition.period.start, monthlyPartition.period.end, Frequency.DAILY)
        partitions = partitions.concat(dailyPartitions)
      }
    }
    return partitions
  }

  async putPartition (key: string, events: Array<TimeSeriesEvent<T>>): Promise<void> {
    function formatValue (event: TimeSeriesEvent<T>, element: FeedElement): string {
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

    function createCSV (events: Array<TimeSeriesEvent<T>>, elements: FeedElement[]): string {
      const csv = events.map(event => {
        const values = elements.map(element => formatValue(event, element))
        return stringify(values)
      })
      csv.unshift(stringify(elements.map(element => element.name)))
      return csv.join('')
    }

    const deidentifiedElements = filterElements(this.timeseries.schema.elements, 'pii')
    const report = createCSV(events, deidentifiedElements)
    await this.snapshot.putObject(key, report)
  }

  makeCasePartions (events: Array<TimeSeriesEvent<T>>, startDate: Date, endDate: Date, frequency: Frequency): Array<CasePartition<T>> {
    const partions: Array<CasePartition<T>> = []
    let partitionPeriod = new Period(startDate, frequency)
    while (!isAfter(partitionPeriod.start, endDate)) {
      const partitionCases = this.findCasesForPeriod(events, partitionPeriod)
      partions.push({ period: partitionPeriod, cases: partitionCases })
      partitionPeriod = partitionPeriod.nextPeriod()
    }
    return partions
  }

  firstEventDate (events: Array<TimeSeriesEvent<T>>): Date | undefined {
    return events.at(0)?.eventAt
  }

  lastEventDate (events: Array<TimeSeriesEvent<T>>): Date | undefined {
    return events.at(-1)?.eventAt
  }

  findCasesForPeriod (events: Array<TimeSeriesEvent<T>>, period: Period): Array<TimeSeriesEvent<T>> {
    return events.filter((event) => { return isWithinInterval(event.eventAt, period.interval) })
  }

  calcMaxLastModified (objects: BucketObject[]): Date | undefined {
    if (objects.length === 0) return undefined
    const modifiedDates = objects.map((object) => { return object.lastModified })
    return maxDate(modifiedDates)
  }

  calcLastPeriod (publishedObjects: BucketObject[]): Period | undefined {
    if (publishedObjects.length === 0) return undefined
    let lastPeriod = periodFromTimeSeriesKey(publishedObjects[0].key)
    for (const publishedObject of publishedObjects) {
      const period = periodFromTimeSeriesKey(publishedObject.key)
      if (isAfter(period.start, lastPeriod.start)) {
        lastPeriod = period
      }
    }
    return lastPeriod
  }

  async findEvents (options: TimeSeriesFindOptions): Promise<Array<TimeSeriesEvent<T>>> {
    const rawEvents = await this.timeseries.findEvents(options)
    return rawEvents.map((e) => this.timeseries.makeTimeSeriesEvent(e))
  }
}
