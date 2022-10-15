import { Interval } from 'date-fns'
import { FeedElement } from './FeedElement'

export interface TimeSeries<T> {
  findEvents: (options: TimeSeriesFindOptions) => Promise<T[]>
  countEvents: (options: TimeSeriesCountOptions) => Promise<number>

  getEventAt: (event: T) => Date
  getEventId: (event: T) => string
  getEventUpdatedAt: (event: T) => Date

  readonly feedElements: FeedElement[]
}

export interface TimeSeriesFindOptions {
  interval?: Interval
  after?: Date
  before?: Date
  updatedAfter?: Date
  sortDescending?: boolean
}

export interface TimeSeriesCountOptions {
  interval?: Interval
  after?: Date
  before?: Date
  updatedAfter?: Date
}
