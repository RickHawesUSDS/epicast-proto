
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
import { CDCCasesFeature } from '@/features/subscribers/CDCCasesFeature'
import { Feature, InitEvent } from '@/features/Feature'
import { StateCaseTimeSeries } from '@/features/publishers/StateCaseTimeSeries'
import { CDCCaseTimeSeries } from '@/features/subscribers/CDCCaseTimeSeries'
import { FeedSubscriber } from '@/features/subscribers/FeedSubscriber'
import { CDCCase } from '@/features/subscribers/CDCCase'

const logger = getLogger('APP')

// The application state is put into every request to share with the request
export interface AppState {
  db: Sequelize
  systemFeature: SystemFeature
  feedsFeature: FeedsFeature
  stateCasesFeature: StateCasesFeature
  cdcCasesFeature: CDCCasesFeature
}

export function getStateCaseTimeSeries (req: express.Request): StateCaseTimeSeries {
  return req.state.stateCasesFeature.stateCaseTimeSeries
}

export function getCDCCaseTimeSeries (req: express.Request): CDCCaseTimeSeries {
  return req.state.cdcCasesFeature.cdcCaseTimeSeries
}

export function getFeedBucket (req: express.Request): FeedBucket {
  return req.state.feedsFeature.bucket
}

export function getCDCSubscriber (req: express.Request): FeedSubscriber<CDCCase> {
  return req.state.cdcCasesFeature.feedSubscriber
}

class App {
  app: express.Application
  state: AppState
  features: Feature[]

  constructor () {
    const feedsFeature = new FeedsFeature()
    const stateCasesFeature = new StateCasesFeature()
    const cdcCasesFeature = new CDCCasesFeature(feedsFeature.bucket)
    const systemFeature = new SystemFeature([feedsFeature, stateCasesFeature, cdcCasesFeature])

    this.state = { db, feedsFeature, systemFeature, stateCasesFeature, cdcCasesFeature }

    this.features = [
      this.state.systemFeature,
      this.state.feedsFeature,
      this.state.stateCasesFeature,
      this.state.cdcCasesFeature
    ]

    this.app = express()
    this.config()
    this.init().catch(error => logger.error(error))
  }

  async init (): Promise<void> {
    for (const feature of this.features) {
      await feature.init(InitEvent.BEFORE_DB)
    }
    await this.databaseSetup()
    for (const feature of this.features) {
      await feature.init(InitEvent.AFTER_DB)
    }
    this.routerSetup()
    for (const feature of this.features) {
      await feature.init(InitEvent.AFTER_ROUTES)
    }
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
      next()
    })
    this.app.use('/', indexRouter)
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
}

export default new App().app
