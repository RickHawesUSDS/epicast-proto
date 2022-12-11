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

export const eventElementNames = ['eventId', 'eventAt', 'eventSubject', 'eventReporterId', 'eventTopicId', 'eventUpdatedAt', 'eventIsDeleted', 'eventReplacedBy']
export type EventElementName = typeof eventElementNames[number]

export interface TimeSeriesEvent {
  readonly eventId: string
  readonly eventAt: Date
  readonly eventTopicId: string
  readonly eventReporterId: string
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
  eventId: string
  replaceBy?: string
}

export interface TimeSeriesMutator<T> {
  updateSubscriberSummary: (subscriberSummary: FeedSummary) => void
  updateSubscriberDictionary: (subscriberDictionary: FeedDictionary) => void
  upsertEvents: (events: T[]) => Promise<void>
  deleteEvents: (events: TimeSeriesDeletedEvent[]) => Promise<void>
  createEvent: (eventValues: any) => T
}

export type MutableTimeSeries<T> = TimeSeries & TimeSeriesMutator<T>
