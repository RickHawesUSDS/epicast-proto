import { Interval } from 'date-fns'
import { FeedDictionary } from './FeedDictionary'
import { FeedSummary } from './FeedSummary'

export interface TimeSeries {
  fetchMetadata: () => Promise<TimeSeriesMetadata | null>
  fetchEvents: (options: TimeSeriesFindOptions) => Promise<TimeSeriesEvent[]>
  countEvents: (options: TimeSeriesCountOptions) => Promise<number>

  readonly dictionary: FeedDictionary
  readonly summary: FeedSummary
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

export const eventElementNames = ['eventId', 'eventAt', 'eventSubject', 'eventReporter', 'eventTopic', 'eventUpdatedAt', 'eventIsDeleted', 'eventReplacedBy']
export type EventElementName = typeof eventElementNames[number]

export interface TimeSeriesEvent {
  readonly eventId: string
  readonly eventAt: Date
  readonly eventSubject: string
  readonly eventReporter: string
  readonly eventTopic: string
  readonly eventUpdatedAt: Date
  readonly eventIsDeleted?: boolean
  readonly eventReplacedBy?: string
  getValue: (name: EventElementName | string) => any
}

export interface TimeSeriesMetadata {
  count: number
  updatedAt: Date
  firstEventAt: Date
  lastEventAt: Date
}

export interface TimeSeriesDeletedEvent {
  eventId: number
  replaceBy: number | undefined
}

export interface TimeSeriesMutator<T> {
  updateDictionary: (newDictionary: FeedDictionary) => void
  upsertEvents: (events: T[]) => void
  deleteEvents: (events: TimeSeriesDeletedEvent[]) => void
  createEvent: (names: string[], values: any[]) => T
}

export type MutableTimeSeries<T> = TimeSeries & TimeSeriesMutator<T>
