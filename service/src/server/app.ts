
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'

import { getLogger } from '../utils/loggers'
import { db, Sequelize } from '../utils/db'
import { FeedBucket } from '@/epicast/FeedBucket'
import indexRouter from './indexRoutes'
import { SystemFeature } from '../features/system/SystemFeature'
import { FeedsFeature } from '../features/feeds/FeedsFeature'
import { StateCasesFeature } from '@/features/publishers/StateCasesFeature'
import cdcCaseRouter from '../features/subscribers/cdcCasesRoutes'
import { updateFeedSubscriber } from '../features/subscribers/updateFeedSubscriber'
import { CDCCaseTimeSeries } from '../features/subscribers/CDCCaseTimeSeries'
import { FeedSubscriber } from '@/features/subscribers/FeedSubscriber'
import { Feature, InitEvent } from '@/features/Feature'
import { StateCaseTimeSeries } from '@/features/publishers/StateCaseTimeSeries'

const logger = getLogger('APP')

// The application state is put into every request to share with the request
export interface AppState {
  db: Sequelize
  systemFeature: SystemFeature
  feedsFeature: FeedsFeature
  stateCasesFeature: StateCasesFeature
}

export function getStateCaseTimeSeries (req: express.Request): StateCaseTimeSeries {
  return req.state.stateCasesFeature.stateCaseTimeSeries
}

export function getFeedBucket (req: express.Request): FeedBucket {
  return req.state.feedsFeature.bucket
}

class App {
  app: express.Application
  state: AppState = {
    db,
    systemFeature: new SystemFeature(),
    feedsFeature: new FeedsFeature(),
    stateCasesFeature: new StateCasesFeature()
  }

  features: Feature[] = [
    this.state.systemFeature,
    this.state.feedsFeature,
    this.state.stateCasesFeature
  ]

  cdcCaseTimeSeries = new CDCCaseTimeSeries()
  feedSubscriber = new FeedSubscriber(this.state.feedsFeature.bucket, this.cdcCaseTimeSeries)

  constructor () {
    this.app = express()
    this.config()
    this.init().catch(error => logger.error(error))
  }

  async init (): Promise<void> {
    await this.databaseSetup()
    for (const feature of this.features) {
      await feature.init(InitEvent.AFTER_DB)
    }
    this.routerSetup()
    for (const feature of this.features) {
      await feature.init(InitEvent.AFTER_ROUTES)
    }
    this.setupBackground()
  }

  private config (): void {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: false }))
    this.app.use(cookieParser())
    this.app.use(express.static(path.join(__dirname, 'public')))
  }

  private routerSetup (): void {
    this.app.use((req, _res, next) => {
      req.state = this.state
      req.cdcCaseTimeSeries = this.cdcCaseTimeSeries
      req.feedSubscriber = this.feedSubscriber
      next()
    })
    this.app.use('/', indexRouter)
    this.app.use('/api/cdcCases', cdcCaseRouter)
    for (const feature of this.features) {
      const [path, router] = feature.getRoutes()
      this.app.use('/api/' + path, router)
    }
  }

  private async databaseSetup (): Promise<void> {
    const modelPaths = this.features.flatMap(f => f.getModelPaths())
    this.state.db.addModels(modelPaths)
    await this.state.db.sync()
  }

  private setupBackground (): void {
    updateFeedSubscriber(this.feedSubscriber, { automatic: true })
  }
}

export default new App().app
