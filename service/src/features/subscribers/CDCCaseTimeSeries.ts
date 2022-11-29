import { FeedDictionary } from '@/epicast/FeedDictionary'
import { FeedSummary } from '@/epicast/FeedSummary'
import { MongoTimeSeries } from '../publishers/MongoTimeSeries'

const initialDictionary: FeedDictionary = {
  topic: 'cases',
  reporter: 'cdc',
  validFrom: new Date(1900, 1, 1), // Early date
  namespaces: [],
  elements: []
}

const initialSummary: FeedSummary = {
  epicastVersion: '0.1',
  subject: 'us',
  reporter: 'cdc',
  topic: 'cases',
  sourceUrl: 'xyz',
  descriptions: [{
    isoCultureCode: 'en-us',
    subjectFullName: 'USA',
    reporterFullName: 'Centers for Disease Control and Prevention',
    topicFullName: 'Demo cases',
    feedDetails: 'This a fake feed for demonstration purposes'
  }],
  contacts: [{ email: 'xyz@dummy.com' }]
}

export class CDCCaseTimeSeries extends MongoTimeSeries {
  constructor () {
    super('cdcCases', initialDictionary, initialSummary)
  }
}
