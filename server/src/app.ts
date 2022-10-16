
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'

import { getLogger } from './utils/loggers'
import indexRouter from './routes/index'
import systemRouter from './routes/system'
import stateCaseRouter from './routes/stateCases'
import { db } from './utils/db'
import { S3Bucket } from './utils/S3Bucket'
import { resetStorage } from './controllers/resetSystem'
import { StateCaseTimeSeries } from './services/StateCaseTimeSeries'
import { Bucket } from '@/models/Bucket'

const logger = getLogger('APP')

class App {
  public app: express.Application
  public db = db
  public stateCaseTimeSeries = new StateCaseTimeSeries()
  public bucket: Bucket = new S3Bucket()

  constructor() {
    this.app = express()
    this.config()
    this.databaseSetup().catch((error) => { logger.error(error) })
    this.storageSetup().catch((error) => { logger.error(error) })
    this.routerSetup()
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
      req.bucket = this.bucket
      next()
    })
    this.app.use('/', indexRouter)
    this.app.use('/api/system', systemRouter)
    this.app.use('/api/stateCases', stateCaseRouter)
  }

  private async databaseSetup(): Promise<void> {
    await this.db.sync()
  }

  private async storageSetup(): Promise<void> {
    await resetStorage(this.bucket)
  }
}

export default new App().app
