import { Router } from 'express'
import { Feature, InitEvent } from '../Feature'
import feedRouter from './feedRoutes'
import { resetStorage } from './resetStorage'
import { S3Storage, FEED_FOLDER } from './S3Storage'

export class FeedsFeature implements Feature {
  storage = new S3Storage(FEED_FOLDER)

  name = 'feed'

  getRoutes(): [string, Router] {
    return ['feed', feedRouter]
  }

  getModelPaths(): string[] {
    return []
  }

  async init(after: InitEvent): Promise<void> {
    if (after === InitEvent.AFTER_DB) {
      await resetStorage(this.storage)
    }
  }

  async reset(): Promise<void> {
    await resetStorage(this.storage)
  }
}
