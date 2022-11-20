
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'

import { getLogger } from '../utils/loggers'
import indexRouter from './indexRoutes'
import { SystemFeature } from '../features/system/SystemFeature'

import stateCaseRouter from '../features/senders/stateCasesRoutes'
import cdcCaseRouter from '../features/receivers/cdcCasesRoutes'
import feedRouter from '../features/feeds/feedRoutes'
import { db } from '../utils/db'
import { S3Bucket } from '../features/feeds/S3Bucket'
import { resetStorage } from '../features/system/resetSystem'
import { updateFeedSubscriber } from '../features/receivers/updateFeedSubscriber'
import { StateCaseTimeSeries } from '../features/senders/StateCaseTimeSeries'
import { FeedBucket } from '@/epicast/FeedBucket'
import { CDCCaseTimeSeries } from '../features/receivers/CDCCaseTimeSeries'
import { FeedSubscriber } from '@/features/receivers/FeedSubscriber'

const logger = getLogger('APP')

class App {
  app: express.Application
  db = db
  systemFeature = new SystemFeature()
  features = [this.systemFeature]

  stateCaseTimeSeries = new StateCaseTimeSeries()
  cdcCaseTimeSeries = new CDCCaseTimeSeries()
  bucket: FeedBucket = new S3Bucket()
  feedSubscriber = new FeedSubscriber(this.bucket, this.cdcCaseTimeSeries)

  constructor() {
    this.app = express()
    this.config()
    this.databaseSetup().catch((error) => { logger.error(error) })
    this.storageSetup().catch((error) => { logger.error(error) })
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
      req.bucket = this.bucket
      next()
    })
    this.app.use('/', indexRouter)
    this.app.use('/api/stateCases', stateCaseRouter)
    this.app.use('/api/cdcCases', cdcCaseRouter)
    this.app.use('/api/feed', feedRouter)
    for (const feature of this.features) {
      const [path, reouter] = feature.getRoutes()
      this.app.use('/api/' + path, reouter)
    }
  }

  private async databaseSetup(): Promise<void> {
    await this.db.sync()
  }

  private async storageSetup(): Promise<void> {
    await resetStorage(this.bucket)
  }

  private setupBackground(): void {
    updateFeedSubscriber(this.feedSubscriber, { automatic: true })
  }
}

export default new App().app
