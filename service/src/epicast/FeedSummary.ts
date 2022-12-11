import { TimeSeriesMetadata } from './TimeSeries'

export interface FeedSummary {
  epicastVersion: string
  reporterId: string
  topicId: string
  sourceUri: string
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
  reporter: string
  topic: string
  subject: string
  details: string
}

export interface FeedContact {
  email?: string
  telephone?: string
}

export function updateFeedSummary(
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
  updated.sourceUri = snapshotUrl ?? ''
  return updated
}
