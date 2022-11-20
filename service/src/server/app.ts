
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'

import { getLogger } from '../utils/loggers'
import indexRouter from './indexRoutes'
import { SystemFeature } from '../features/system/SystemFeature'
import { FeedsFeature } from '../features/feeds/FeedsFeature'

import stateCaseRouter from '../features/senders/stateCasesRoutes'
import cdcCaseRouter from '../features/receivers/cdcCasesRoutes'
import { db } from '../utils/db'
import { S3Bucket } from '../features/feeds/S3Bucket'
import { resetStorage } from "../features/feeds/resetStorage"
import { updateFeedSubscriber } from '../features/receivers/updateFeedSubscriber'
import { StateCaseTimeSeries } from '../features/senders/StateCaseTimeSeries'
import { FeedBucket } from '@/epicast/FeedBucket'
import { CDCCaseTimeSeries } from '../features/receivers/CDCCaseTimeSeries'
import { FeedSubscriber } from '@/features/receivers/FeedSubscriber'
import { InitEvent } from '@/features/Feature'

const logger = getLogger('APP')

class App {
  app: express.Application
  db = db
  systemFeature = new SystemFeature()
  feedsFeature = new FeedsFeature()
  features = [
    this.systemFeature,
    this.feedsFeature
  ]

  stateCaseTimeSeries = new StateCaseTimeSeries()
  cdcCaseTimeSeries = new CDCCaseTimeSeries()
  feedSubscriber = new FeedSubscriber(this.feedsFeature.bucket, this.cdcCaseTimeSeries)

  constructor() {
    this.app = express()
    this.config()
    this.init().catch(error => logger.error(error))
  }

  async init(): Promise<void> {
    this.databaseSetup().catch((error) => { logger.error(error) })
    for (const feature of this.features) {
      await feature.init(InitEvent.AFTER_DB)
    }
    this.routerSetup()
    this.setupBackground()
  }

  private config(): void {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: false }))
    this.app.use(cookieParser())
    this.app.use(express.static(path.join(__dirname, 'public')))
  }

  private routerSetup(): void {
    this.app.use((req, _res, next) => {
      req.db = this.db
      req.stateCaseTimeSeries = this.stateCaseTimeSeries
      req.cdcCaseTimeSeries = this.cdcCaseTimeSeries
      req.feedSubscriber = this.feedSubscriber
      req.bucket = this.feedsFeature.bucket
      next()
    })
    this.app.use('/', indexRouter)
    this.app.use('/api/stateCases', stateCaseRouter)
    this.app.use('/api/cdcCases', cdcCaseRouter)
    for (const feature of this.features) {
      const [path, router] = feature.getRoutes()
      this.app.use('/api/' + path, router)
    }
  }

  private async databaseSetup(): Promise<void> {
    await this.db.sync()
  }

  private setupBackground(): void {
    updateFeedSubscriber(this.feedSubscriber, { automatic: true })
  }
}

export default new App().app
