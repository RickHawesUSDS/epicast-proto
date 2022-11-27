
export interface FeedSummary {
  epicastVersion: string
  subject: string
  reporter: string
  topic: string
  sourceUrl: string
  sourceFeeds: FeedSummary[]
  descriptions?: FeedDescription[]
  contacts?: FeedContact[]
  lastUpdated: Date
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
