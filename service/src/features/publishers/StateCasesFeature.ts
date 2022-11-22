import { Router } from 'express'
import { join } from 'path/posix'
import { Feature, InitEvent } from '../Feature'
import { StateCase } from './StateCase'
import stateCasesRouter from './stateCasesRoutes'
import { StateCaseTimeSeries } from './StateCaseTimeSeries'

export class StateCasesFeature implements Feature {
  stateCaseTimeSeries = new StateCaseTimeSeries()

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
  }
}
