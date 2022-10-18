import { Interval } from 'date-fns'
import { FeedSchema } from './FeedSchema'

export interface TimeSeries {
  fetchMetadata(): Promise<TimeSeriesMetadata | null>
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
  getValue(name: string): any
}

export interface TimeSeriesMetadata {
  lastUpdatedAt: Date,
  lastEventAt: Date,
}

export interface TimeSeriesMutator<T> {
  updateSchema(newSchema: FeedSchema): void
  upsertEvents(events: T[]): void
  createEvent(names: string[], values: any[]): T
}
