
import express from 'express'
import path from 'path'
import http from 'http'
import cookieParser from 'cookie-parser'
import { getLogger } from './loggers'
import { attachToDb } from './mongo'
import indexRouter from './indexRoute'
import { SystemFeature } from '../features/system/SystemFeature'
import { FeedsFeature } from '../features/feeds/FeedsFeature'
import { Feature } from '@/server/Feature'
import { AgenciesFeature } from '@/features/agencies/AgenciesFeature'
import { AppState } from './AppState'
import { S3Client } from '@aws-sdk/client-s3'
import { Db } from 'mongodb'
import { getS3Client } from './s3'

const logger = getLogger('APP')

export class App {
  expressApp: express.Application
  port: string | number

  // App State
  s3Client?: S3Client
  db?: Db
  feedsFeature: FeedsFeature
  systemFeature: SystemFeature
  agenciesFeature: AgenciesFeature
  features: Feature[]

  constructor () {
    this.port = this.normalizePort(process.env.PORT ?? '3000')
    this.feedsFeature = new FeedsFeature()
    this.agenciesFeature = new AgenciesFeature()
    this.systemFeature = new SystemFeature([this.feedsFeature, this.agenciesFeature])
    this.features = [this.systemFeature, this.feedsFeature, this.agenciesFeature]
    this.expressApp = express()
    this.configExpress()
  }

  public listen (): void {
    const server = http.createServer(this.expressApp)
    server.listen(this.port, () => {
      logger.info(`🚀 Server launch ~ port ${this.port} ~ ${process.env.NODE_ENV} environment`)
    })
    server.on('error', this.onError)
  }

  public getServer (): express.Application {
    return this.expressApp
  }

  async init (): Promise<void> {
    logger.info('Starting init sequence...')
    this.db = await attachToDb()
    this.s3Client = getS3Client()
    const state = this.formAppState()
    for (const feature of this.features) {
      await feature.init(state)
    }
    this.routerSetup()
  }

  private normalizePort (val: string): number | string {
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

  private configExpress (): void {
    this.expressApp.use(express.json())
    this.expressApp.use(express.urlencoded({ extended: false }))
    this.expressApp.use(cookieParser())
    this.expressApp.use(express.static(path.join(__dirname, 'public')))
  }

  private routerSetup (): void {
    this.expressApp.use((req, _res, next) => {
      req.state = this.formAppState()
      next()
    })
    this.expressApp.use('/', indexRouter)
    for (const feature of this.features) {
      const [path, router] = feature.getRoutes()
      this.expressApp.use('/api/' + path, router)
    }
  }

  private formAppState (): AppState {
    if (this.db === undefined || this.s3Client === undefined) throw new Error('App is not initialized')
    return { db: this.db, s3Client: this.s3Client, systemFeature: this.systemFeature, feedsFeature: this.feedsFeature, agenciesFeature: this.agenciesFeature }
  }

  private onError (error: { syscall: string, code: string }): void {
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
