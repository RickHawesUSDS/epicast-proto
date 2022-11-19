import { Interval } from 'date-fns'
import { FeedSchema } from './FeedSchema'

export interface TimeSeries<T> {
  fetchMetadata: () => Promise<TimeSeriesMetadata | null>
  findEvents: (options: TimeSeriesFindOptions) => Promise<T[]>
  countEvents: (options: TimeSeriesCountOptions) => Promise<number>
  makeTimeSeriesEvent: (event: T) => TimeSeriesEvent<T>

  readonly schema: FeedSchema
}

export interface TimeSeriesFindOptions {
  interval?: Interval
  after?: Date
  before?: Date
  updatedAfter?: Date
  isDeleted?: boolean
  sortDescending?: boolean
}

export interface TimeSeriesCountOptions {
  interval?: Interval
  after?: Date
  before?: Date
  isDeleted?: boolean
  updatedAfter?: Date
}

export interface TimeSeriesEvent<T> {
  get eventAt(): Date
  get eventId(): number
  get eventUpdatedAt(): Date
  get isDeleted(): boolean | undefined
  get replacedBy(): number | undefined
  getValue: (name: string) => any
  get model(): T
}

export interface TimeSeriesMetadata {
  lastUpdatedAt: Date
  lastEventAt: Date
}

export interface TimeSeriesDeletedEvent {
  eventId: number
  replaceBy: number | undefined
}

export interface TimeSeriesMutator<T> {
  updateSchema: (newSchema: FeedSchema) => void
  upsertEvents: (events: T[]) => void
  deleteEvents: (events: TimeSeriesDeletedEvent[]) => void
  createEvent: (names: string[], values: any[]) => T
}

export type MutableTimeSeries<T> = TimeSeries<T> & TimeSeriesMutator<T>
