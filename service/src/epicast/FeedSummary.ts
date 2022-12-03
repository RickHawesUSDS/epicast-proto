import { TimeSeriesMetadata } from './TimeSeries'

export interface FeedSummary {
  epicastVersion: string
  subject: string
  reporter: string
  topic: string
  sourceUrl: string
  descriptions: FeedDescription[]
  contacts: FeedContact[]
  sourceFeeds?: FeedSummary[]
  eventCount?: number
  updatedAt?: string
  firstEventAt?: string
  lastEventAt?: string
}

export interface FeedDescription {
  isoCultureCode: string
  subjectFullName: string
  reporterFullName: string
  topicFullName: string
  feedDetails: string
}

export interface FeedContact {
  email?: string
  telephone?: string
}

export function updateFeedSummary (
  initial: FeedSummary,
  timeSeriesMetadata: TimeSeriesMetadata | null,
  snapshotUrl?: string
): FeedSummary {
  if (timeSeriesMetadata === null) return initial
  const updated = { ...initial }
  updated.eventCount = timeSeriesMetadata.count
  updated.firstEventAt = timeSeriesMetadata.firstEventAt.toISOString()
  updated.lastEventAt = timeSeriesMetadata.lastEventAt.toISOString()
  updated.updatedAt = timeSeriesMetadata.updatedAt.toISOString()
  updated.sourceUrl = snapshotUrl ?? ''
  return updated
}
