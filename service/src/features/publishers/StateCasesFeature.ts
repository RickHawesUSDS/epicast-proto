import { Db } from 'mongodb'
import { Router } from 'express'
import { Feature, InitEvent } from '../Feature'
import stateCasesRouter from './stateCasesRoutes'
import { StateCaseTimeSeries } from './StateCaseTimeSeries'

const DAYS_OF_FAKE = 1
const FAKES_PER_DAY = 5
export class StateCasesFeature implements Feature {
  stateCaseTimeSeries = new StateCaseTimeSeries()

  name = 'stateCases'

  getRoutes (): [string, Router] {
    return ['stateCases', stateCasesRouter]
  }

  async init (during: InitEvent, db: Db): Promise<void> {
    if (during === InitEvent.AFTER_DB) {
      await this.stateCaseTimeSeries.initialize(db)
    }
  }

  async reset (): Promise<void> {
    this.stateCaseTimeSeries.resetDictionary()
    await this.stateCaseTimeSeries.dropAllEvents()
    await this.stateCaseTimeSeries.insertFakeStateCases(DAYS_OF_FAKE, FAKES_PER_DAY)
  }
}
