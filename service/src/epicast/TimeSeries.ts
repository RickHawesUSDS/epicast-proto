import { Interval } from 'date-fns'
import { FeedDictionary } from './FeedDictionary'

export interface TimeSeries<T> {
  fetchMetadata: () => Promise<TimeSeriesMetadata | null>
  fetchEvents: (options: TimeSeriesFindOptions) => Promise<Array<TimeSeriesEvent<T>>>
  countEvents: (options: TimeSeriesCountOptions) => Promise<number>

  readonly schema: FeedDictionary
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
  get eventId(): string
  get eventUpdatedAt(): Date
  get eventIsDeleted(): boolean | undefined
  get eventReplacedBy(): string | undefined
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
  updateSchema: (newSchema: FeedDictionary) => void
  upsertEvents: (events: T[]) => void
  deleteEvents: (events: TimeSeriesDeletedEvent[]) => void
  createEvent: (names: string[], values: any[]) => T
}

export type MutableTimeSeries<T> = TimeSeries<T> & TimeSeriesMutator<T>
