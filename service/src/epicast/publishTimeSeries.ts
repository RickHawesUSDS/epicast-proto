import { max as maxDate, isAfter, formatISO, isFirstDayOfMonth, addDays, isBefore, startOfDay, differenceInDays, endOfDay } from 'date-fns'
import { stringify } from 'csv-string'

import { BucketObject } from './FeedBucket'
import { formDeletedKey, formTimeSeriesKey, periodFromTimeSeriesKey, TIMESERIES_FOLDER } from './feedBucketKeys'
import { getLogger } from '@/utils/loggers'
import { Period } from './Period'
import { Frequency } from './Frequency'
import { TimeSeries, TimeSeriesEvent, TimeSeriesFindOptions } from './TimeSeries'
import { FeedElement, filterElements } from './FeedElement'
import { assert } from 'console'
import { MutableSnapshot } from './Snapshot'
import { TimeSeriesPartition, makeCasePartions } from './TimeSeriesPartition'

const DESIRED_MAX_MONTHLY_COUNT = 10000 / 30

const logger = getLogger('PUBLISH_TIME_SERIES_SERVICE')

export async function publishTimeseries<T> (toSnapshot: MutableSnapshot, timeseries: TimeSeries<T>): Promise<number> {
  logger.info(`publishing timeseries: ${timeseries.schema.subjectId}-${timeseries.schema.reporterId}`)
  const publisher = new TimeSeriesPublisher(toSnapshot, timeseries)
  return await publisher.publish()
}
class TimeSeriesPublisher<T> {
  snapshot: MutableSnapshot
  timeseries: TimeSeries<T>

  constructor (toSnapshot: MutableSnapshot, timeseries: TimeSeries<T>) {
    this.snapshot = toSnapshot
    this.timeseries = timeseries
  }

  async publish (): Promise<number> {
    let count = await this.updatePublishedPartions()
    count += await this.publishNewPartitions()
    return count
  }

  async updatePublishedPartions (): Promise<number> {
    const publishedObjects = await this.snapshot.listObjects(TIMESERIES_FOLDER)
    if (publishedObjects.length === 0) return 0 // early shortcut
    const lastPublishDate = this.calcMaxLastModified(publishedObjects)

    let count = 0
    for (const publishedObject of publishedObjects) {
      const period = periodFromTimeSeriesKey(publishedObject.key)
      const isPeriodUpdated = await this.hasUpdates(period, lastPublishDate)
      if (isPeriodUpdated) {
        const periodCases = await this.findEvents({ interval: period.interval })
        logger.debug(`updating partition ${publishedObject.key} with ${periodCases.length} cases`)
        await this.putPartition(period, periodCases)

        const periodDeletedCases = await this.findEvents({ interval: period.interval, isDeleted: true })
        if (periodDeletedCases.length > 0) {
          logger.debug(`updating deleted for ${publishedObject.key} with ${periodDeletedCases.length} cases`)
          await this.putDeletedPartition(period, periodDeletedCases)
        }
        count += 1
      }
    }
    return count
  }

  async hasUpdates (period: Period, after?: Date): Promise<boolean> {
    let updatedCount: number
    if (after !== undefined) {
      updatedCount = await this.timeseries.countEvents({ interval: period.interval, updatedAfter: after })
    } else {
      updatedCount = await this.timeseries.countEvents({ interval: period.interval })
    }
    let deletedCount: number
    if (after !== undefined) {
      deletedCount = await this.timeseries.countEvents({ interval: period.interval, updatedAfter: after, isDeleted: true })
    } else {
      deletedCount = await this.timeseries.countEvents({ interval: period.interval, isDeleted: true })
    }
    return updatedCount > 0 || deletedCount > 0
  }

  async findLastPublishedPeriod (): Promise<Period | undefined> {
    const publishedObjects = await this.snapshot.listObjects(TIMESERIES_FOLDER)
    return this.calcLastPeriod(publishedObjects)
  }

  async publishNewPartitions (): Promise<number> {
    const fetchNewEvents = async (lastPublishedPeriod: Period | undefined): Promise<[Array<TimeSeriesEvent<T>>, Date, Date]> => {
      // Get the events
      if (lastPublishedPeriod === undefined) {
        const events = await this.findEvents({})
        return [
          events,
          startOfDay(this.firstEventDate(events) ?? new Date()),
          endOfDay(this.lastEventDate(events) ?? new Date())
        ]
      } else {
        const startDate = lastPublishedPeriod.nextPeriod().start
        const events = await this.findEvents({ after: startDate })
        const endDate = endOfDay(this.lastEventDate(events) ?? new Date())
        return [events, startDate, endDate]
      }
    }

    const lastPublishedPeriod = await this.findLastPublishedPeriod()
    const [events, startDate, endDate] = await fetchNewEvents(lastPublishedPeriod)
    if (events.length === 0) return 0 // short circuit
    const partitions = await this.makeRightSizedPartitions(events, startDate, endDate, lastPublishedPeriod)
    for (const partition of partitions) {
      await this.putPartition(partition.period, partition.events)

      const deletedEvents = await this.findEvents({ interval: partition.period.interval, isDeleted: true })
      if (deletedEvents.length > 0) {
        await this.putDeletedPartition(partition.period, deletedEvents)
      }
    }
    return partitions.length
  }

  async makeRightSizedPartitions (events: Array<TimeSeriesEvent<T>>, startDate: Date, endDate: Date, lastPublishedPeriod?: Period): Promise<Array<TimeSeriesPartition<T>>> {
    assert(isBefore(startDate, endDate), 'end before start date')
    assert(
      lastPublishedPeriod === undefined ||
      (lastPublishedPeriod.frequency === Frequency.MONTHLY && isFirstDayOfMonth(startDate)) ||
      lastPublishedPeriod.frequency === Frequency.DAILY,
      'expected new monthly updates to start on the first day of the month'
    )
    if (events.length === 0) return []

    // This code basically decides between daily and monthly partitions based on partition size.
    let partitions: Array<TimeSeriesPartition<T>> = []
    const monthlyPartitions = makeCasePartions(events, Frequency.MONTHLY, startDate, endDate)
    // look at each monthly partition and decide if it is too large
    for (let index = 0; index < monthlyPartitions.length; index++) {
      const monthlyPartition = monthlyPartitions[index]
      let count
      if (index === 0) {
        count = await this.timeseries.countEvents({ after: startOfDay(addDays(monthlyPartition.period.end, -30)), before: monthlyPartition.period.end })
      } else {
        count = monthlyPartition.events.length
      }
      const lengthOfPeriod = Math.min(differenceInDays(monthlyPartition.period.end, monthlyPartition.period.start), 1)
      if ((count / lengthOfPeriod) < DESIRED_MAX_MONTHLY_COUNT) {
        partitions = partitions.concat(monthlyPartition)
      } else {
        const dailyPartitions = makeCasePartions(events, Frequency.DAILY, monthlyPartition.period.start, monthlyPartition.period.end)
        partitions = partitions.concat(dailyPartitions)
      }
    }
    return partitions
  }

  async putPartition (period: Period, events: Array<TimeSeriesEvent<T>>): Promise<void> {

    function formatValue (event: TimeSeriesEvent<T>, element: FeedElement): string {
      let result: string
      if (element.name === 'eventId') {
        result = event.eventId
      } else if (element.name === 'eventAt') {
        result = formatISO(event.eventAt)
      } else if (element.name === 'eventUpdatedAt') {
        result = formatISO(event.eventUpdatedAt)
      } else if (element.type === 'date') {
        const value = event.getValue(element.name) as Date
        result = formatISO(value)
      } else {
        result = event.getValue(element.name) as string ?? ''
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
    const key = formTimeSeriesKey(period)
    await this.snapshot.putObject(key, report)
  }

  async putDeletedPartition (period: Period, events: Array<TimeSeriesEvent<T>>): Promise<void> {
    const key = formDeletedKey(period)
    const createCSV = (events: Array<TimeSeriesEvent<T>>): string => {
      const csvRow: string[] = [stringify(['eventId', 'replacedBy'])]
      for (const event of events) {
        csvRow.push(stringify([event.eventId.toString(), event.eventReplacedBy?.toString()]))
      }
      return csvRow.join('')
    }

    const deleted = createCSV(events)
    await this.snapshot.putObject(key, deleted)
  }

  firstEventDate (events: Array<TimeSeriesEvent<T>>): Date | undefined {
    return events.at(0)?.eventAt
  }

  lastEventDate (events: Array<TimeSeriesEvent<T>>): Date | undefined {
    return events.at(-1)?.eventAt
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
