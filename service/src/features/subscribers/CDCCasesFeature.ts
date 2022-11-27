import { FeedStorage } from '@/epicast/FeedStorage'
import { Router } from 'express'
import { join } from 'path/posix'
import { Feature, InitEvent } from '../Feature'
import { CDCCase } from './CDCCase'
import cdcCaseRouter from './cdcCasesRoutes'
import { CDCCaseTimeSeries } from './CDCCaseTimeSeries'
import { FeedSubscriber } from './FeedSubscriber'
import { updateFeedSubscriber } from './updateFeedSubscriber'

export class CDCCasesFeature implements Feature {
  cdcCaseTimeSeries: CDCCaseTimeSeries
  feedSubscriber: FeedSubscriber<CDCCase>

  constructor (storage: FeedStorage) {
    this.cdcCaseTimeSeries = new CDCCaseTimeSeries()
    this.feedSubscriber = new FeedSubscriber(storage, this.cdcCaseTimeSeries)
  }

  name = 'cdcCases'

  getRoutes (): [string, Router] {
    return ['cdcCases', cdcCaseRouter]
  }

  getModelPaths (): string[] {
    return [join(__dirname, './CDCCase.ts')]
  }

  async init (after: InitEvent): Promise<void> {
    if (after === InitEvent.AFTER_ROUTES) {
      updateFeedSubscriber(this.feedSubscriber, { automatic: true })
    }
  }

  async reset (): Promise<void> {
    await CDCCase.destroy({
      truncate: true
    })
  }
}
