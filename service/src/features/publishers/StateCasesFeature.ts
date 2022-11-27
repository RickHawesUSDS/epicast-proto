import { Router } from 'express'
import { join } from 'path/posix'
import { Feature, InitEvent } from '../Feature'
import { StateCase } from './StateCase'
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

  getModelPaths (): string[] {
    return [join(__dirname, './StateCase.ts')]
  }

  async init (after: InitEvent): Promise<void> {
  }

  async reset (): Promise<void> {
    await StateCase.destroy({
      truncate: true
    })
    this.stateCaseTimeSeries.resetDictionary()
    await this.stateCaseTimeSeries.insertFakeStateCases(DAYS_OF_FAKE, FAKES_PER_DAY)
  }
}
