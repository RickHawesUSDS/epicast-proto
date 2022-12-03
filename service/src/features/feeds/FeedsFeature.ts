import { Request, Router } from 'express'
import { Feature, InitEvent } from '../../server/Feature'
import feedRouter from './feedRoutes'
import { resetStorage } from './resetStorage'
import { S3Storage } from './S3Storage'

export class FeedsFeature implements Feature {
  storage = new S3Storage()

  name = 'feeds'

  getRoutes (): [string, Router] {
    return [this.name, feedRouter]
  }

  async init (after: InitEvent): Promise<void> {
    if (after === InitEvent.AFTER_DB) {
      await resetStorage(this.storage)
    }
  }

  async reset (): Promise<void> {
    await resetStorage(this.storage)
  }
}

export function getFeedStorage (req: Request): S3Storage {
  return req.state.feedsFeature.storage
}
