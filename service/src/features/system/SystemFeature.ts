import { getLogger } from '@/utils/loggers'
import { Router } from 'express'
import { Feature, InitEvent } from '../Feature'
import systemRoutes from './systemRoutes'

export const logger = getLogger('RESET_SYSTEM')

export class SystemFeature implements Feature {
  otherFeatures: Feature[]
  name = 'system'

  constructor (otherFeatures: Feature[]) {
    this.otherFeatures = otherFeatures
  }

  getRoutes (): [string, Router] {
    return ['system', systemRoutes]
  }

  getModelPaths (): string[] {
    return []
  }

  async init (after: InitEvent): Promise<void> {
  }

  async reset (): Promise<void> {
    for (const feature of this.otherFeatures) {
      logger.info(`Resetting: ${feature.name}`)
      await feature.reset()
    }
  }
}
