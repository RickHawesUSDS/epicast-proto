import { FeedStorage } from '@/epicast/FeedStorage'
import { Db } from 'mongodb'
import { Router } from 'express'
import { Feature, InitEvent } from '../Feature'
import { MongoTimeSeriesEvent } from '../publishers/MongoTimeSeriesEvent'
import cdcCaseRouter from './cdcCasesRoutes'
import { CDCCaseTimeSeries } from './CDCCaseTimeSeries'
import { FeedSubscriber } from './FeedSubscriber'
import { updateFeedSubscriber } from './updateFeedSubscriber'

export class CDCCasesFeature implements Feature {
  cdcCaseTimeSeries: CDCCaseTimeSeries
  feedSubscriber: FeedSubscriber<MongoTimeSeriesEvent>

  constructor (storage: FeedStorage) {
    this.cdcCaseTimeSeries = new CDCCaseTimeSeries()
    this.feedSubscriber = new FeedSubscriber(storage, this.cdcCaseTimeSeries)
  }

  name = 'cdcCases'

  getRoutes (): [string, Router] {
    return ['cdcCases', cdcCaseRouter]
  }

  async init (during: InitEvent, db: Db): Promise<void> {
    if (during === InitEvent.AFTER_DB) {
      await this.cdcCaseTimeSeries.initialize(db)
    }
    if (during === InitEvent.AFTER_ROUTES) {
      updateFeedSubscriber(this.feedSubscriber, { automatic: true })
    }
  }

  async reset (): Promise<void> {
    await this.cdcCaseTimeSeries.dropAllEvents()
  }
}
