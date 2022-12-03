import { getLogger } from '@/utils/loggers'
import { Router } from 'express'
import { Feature } from '../../server/Feature'
import systemRoutes from './systemRoutes'

export const logger = getLogger('RESET_SYSTEM')

export class SystemFeature implements Feature {
  otherFeatures: Feature[]
  name = 'system'

  constructor (otherFeatures: Feature[]) {
    this.otherFeatures = otherFeatures
  }

  getRoutes (): [string, Router] {
    return [this.name, systemRoutes]
  }

  async init (): Promise<void> {
  }

  async reset (): Promise<void> {
    for (const feature of this.otherFeatures) {
      logger.info(`Resetting: ${feature.name}`)
      await feature.reset()
    }
  }
}
