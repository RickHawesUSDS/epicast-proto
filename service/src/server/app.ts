
import express from 'express'
import path from 'path'
import http from 'http'
import cookieParser from 'cookie-parser'
import { getLogger } from './loggers'
import { attachToDb } from './mongo'
import indexRouter from './indexRoutes'
import { SystemFeature } from '../features/system/SystemFeature'
import { FeedsFeature } from '../features/feeds/FeedsFeature'
import { Feature, InitEvent } from '@/server/Feature'
import { AgenciesFeature } from '@/features/agencies/AgenciesFeature'
import { Db } from 'mongodb'

const logger = getLogger('APP')

// The application state is put into every request to share with the request
export interface AppState {
  db?: Db
  systemFeature: SystemFeature
  feedsFeature: FeedsFeature
  agenciesFeature: AgenciesFeature
}

export class App {
  expressApp: express.Application
  state: AppState
  features: Feature[]
  port: string | number

  constructor() {
    const feedsFeature = new FeedsFeature()
    const agenciesFeature = new AgenciesFeature()
    const systemFeature = new SystemFeature([feedsFeature, agenciesFeature])
    this.port = this.normalizePort(process.env.PORT ?? '3000')

    this.state = { systemFeature, feedsFeature, agenciesFeature }

    this.features = [
      this.state.systemFeature,
      this.state.feedsFeature,
      this.state.agenciesFeature
    ]

    this.expressApp = express()
    this.configExpress()
  }

  public listen(): void {
    const server = http.createServer(this.expressApp)
    server.listen(this.port, () => {
      logger.info(`🚀 Server launch ~ port ${this.port} ~ ${process.env.NODE_ENV} environment`)
    })
    server.on('error', this.onError)
  }

  public getServer(): express.Application {
    return this.expressApp;
  }

  async init(): Promise<void> {
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

  private normalizePort(val: string): number | string  {
    const port = parseInt(val, 10)
    if (isNaN(port)) {
      // named pipe
      return val
    }
    if (port >= 0) {
      // port number
      return port
    }
    throw new Error(`port is invalid: ${val}`)
  }

  private configExpress(): void {
    this.expressApp.use(express.json())
    this.expressApp.use(express.urlencoded({ extended: false }))
    this.expressApp.use(cookieParser())
    this.expressApp.use(express.static(path.join(__dirname, 'public')))
  }

  private routerSetup(): void {
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

  private onError(error: { syscall: string, code: string }): void {
    if (error.syscall !== 'listen') {
      throw new Error(error.code)
    }

    const bind = typeof this.port === 'string' ? 'Pipe ' + this.port : 'Port ' + this.port.toString()

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges')
        process.exit(1)
        break
      case 'EADDRINUSE':
        console.error(bind + ' is already in use')
        process.exit(1)
        break
      default:
        throw new Error(error.code)
    }
  }
}
