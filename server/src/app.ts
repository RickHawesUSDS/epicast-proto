
import express, { RequestHandler, } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index';
import systemRouter from './routes/system'
import caseRouter from './routes/case'
import { db }  from './utils/db'

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.databaseSetup();
    this.routerSetup();
  }

  private config() {
    this.app.use(logger('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  private routerSetup() {
    this.app.use('/', indexRouter);
    this.app.use('/api/system', systemRouter)
    this.app.use('/api/case', caseRouter)
  }

  private async databaseSetup() {
    await db.sync()
  }
}

export default new App().app;

