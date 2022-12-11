
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import { getLogger } from '../utils/loggers'
import { attachToDb, Db } from '../features/agencies/mongo'
import indexRouter from './indexRoutes'
import { SystemFeature } from '../features/system/SystemFeature'
import { FeedsFeature } from '../features/feeds/FeedsFeature'
import { Feature, InitEvent } from '@/server/Feature'
import { AgenciesFeature } from '@/features/agencies/AgenciesFeature'

const logger = getLogger('APP')

// The application state is put into every request to share with the request
export interface AppState {
  db?: Db
  systemFeature: SystemFeature
  feedsFeature: FeedsFeature
  agenciesFeature: AgenciesFeature
}

class App {
  expressApp: express.Application
  state: AppState
  features: Feature[]

  constructor () {
    const feedsFeature = new FeedsFeature()
    const agenciesFeature = new AgenciesFeature()
    const systemFeature = new SystemFeature([feedsFeature, agenciesFeature])

    this.state = { systemFeature, feedsFeature, agenciesFeature }

    this.features = [
      this.state.systemFeature,
      this.state.feedsFeature,
      this.state.agenciesFeature
    ]

    this.expressApp = express()
    this.config()
  }

  async init (): Promise<void> {
    logger.info('Starting init sequence...')
    this.state.db = await attachToDb()
    for (const feature of this.features) {
      await feature.init(InitEvent.AFTER_DB, this.state)
    }
    this.routerSetup()
    for (const feature of this.features) {
      await feature.init(InitEvent.AFTER_ROUTES, this.state)
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
