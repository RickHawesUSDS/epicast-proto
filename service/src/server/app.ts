
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import { Db } from 'mongodb'

import { getLogger } from '../utils/loggers'
import { attachToDb } from '../utils/db'
import indexRouter from './indexRoutes'
import { SystemFeature } from '../features/system/SystemFeature'
import { FeedsFeature } from '../features/feeds/FeedsFeature'
import { StateCasesFeature } from '@/features/publishers/StateCasesFeature'
import { CDCCasesFeature } from '@/features/subscribers/CDCCasesFeature'
import { Feature, InitEvent } from '@/features/Feature'
import { StateCaseTimeSeries } from '@/features/publishers/StateCaseTimeSeries'
import { CDCCaseTimeSeries } from '@/features/subscribers/CDCCaseTimeSeries'
import { FeedSubscriber } from '@/features/subscribers/FeedSubscriber'
import { S3Storage } from '@/features/feeds/S3Storage'
import { MongoTimeSeriesEvent } from '@/features/publishers/MongoTimeSeriesEvent'

const logger = getLogger('APP')

// The application state is put into every request to share with the request
export interface AppState {
  db?: Db
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

export function getFeedStorage (req: express.Request): S3Storage {
  return req.state.feedsFeature.storage
}

export function getCDCSubscriber (req: express.Request): FeedSubscriber<MongoTimeSeriesEvent> {
  return req.state.cdcCasesFeature.feedSubscriber
}

class App {
  expressApp: express.Application
  state: AppState
  features: Feature[]

  constructor () {
    const feedsFeature = new FeedsFeature()
    const stateCasesFeature = new StateCasesFeature()
    const cdcCasesFeature = new CDCCasesFeature(feedsFeature.storage)
    const systemFeature = new SystemFeature([feedsFeature, stateCasesFeature, cdcCasesFeature])

    this.state = { feedsFeature, systemFeature, stateCasesFeature, cdcCasesFeature }

    this.features = [
      this.state.systemFeature,
      this.state.feedsFeature,
      this.state.stateCasesFeature,
      this.state.cdcCasesFeature
    ]

    this.expressApp = express()
    this.config()
  }

  async init (): Promise<void> {
    logger.info('Starting init sequence...')
    this.state.db = await attachToDb()
    for (const feature of this.features) {
      await feature.init(InitEvent.AFTER_DB, this.state.db)
    }
    this.routerSetup()
    for (const feature of this.features) {
      await feature.init(InitEvent.AFTER_ROUTES, this.state.db)
    }
  }

  private config (): void {
    this.expressApp.use(express.json())
    this.expressApp.use(express.urlencoded({ extended: false }))
    this.expressApp.use(cookieParser())
    this.expressApp.use(express.static(path.join(__dirname, 'public')))
  }

  private routerSetup (): void {
    this.expressApp.use((req, _res, next) => {
      req.state = this.state
      next()
    })
    this.expressApp.use('/', indexRouter)
    for (const feature of this.features) {
      const [path, router] = feature.getRoutes()
      this.expressApp.use('/api/' + path, router)
    }
  }
}

export const app = new App()
export const expressApp = app.expressApp
