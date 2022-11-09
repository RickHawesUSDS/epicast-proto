import { Frequency } from '@/utils/Frequency'
import { Period } from '@/utils/Period'
import { isAfter, isWithinInterval } from 'date-fns'
import { TimeSeriesEvent } from './TimeSeries'

export class TimeSeriesPartition<T> {
  period: Period
  events: Array<TimeSeriesEvent<T>>

  constructor (period: Period, events: Array<TimeSeriesEvent<T>>) {
    this.period = period
    this.events = events
  }
}

export function makeCasePartions<T> (events: Array<TimeSeriesEvent<T>>, frequency: Frequency, optionalStartDate?: Date, optionalEndDate?: Date): Array<TimeSeriesPartition<T>> {
  if (events.length === 0) return []
  const partions: Array<TimeSeriesPartition<T>> = []
  const startDate = optionalStartDate !== undefined ? optionalStartDate : events[0].eventAt
  const endDate = optionalEndDate !== undefined ? optionalEndDate : events[events.length - 1].eventAt
  let partitionPeriod = new Period(startDate, frequency)
  while (!isAfter(partitionPeriod.start, endDate)) {
    const partitionCases = findCasesForPeriod(events, partitionPeriod)
    partions.push(new TimeSeriesPartition(partitionPeriod, partitionCases))
    partitionPeriod = partitionPeriod.nextPeriod()
  }
  return partions
}

function findCasesForPeriod<T> (events: Array<TimeSeriesEvent<T>>, period: Period): Array<TimeSeriesEvent<T>> {
  return events.filter((event) => { return isWithinInterval(event.eventAt, period.interval) })
}
