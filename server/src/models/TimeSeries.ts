import { Interval } from 'date-fns'
import { FeedSchema } from './FeedSchema'

export interface TimeSeries {
  findEvents(options: TimeSeriesFindOptions): Promise<TimeSeriesEvent[]>
  countEvents(options: TimeSeriesCountOptions): Promise<number>

  readonly schema: FeedSchema
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

export interface TimeSeriesEvent {
  get eventAt(): Date
  get eventId(): number
  get eventUpdatedAt(): Date
  getValue: (name: string) => any
}

export interface TimeSeriesMutator {
  updateSchema(newSchema: FeedSchema): void
  updateEvents(events: TimeSeriesEvent[]): void
  initialize(newSchema: FeedSchema, newEvents: TimeSeriesEvent[]): void
}
