import { Router } from 'express'
import { Feature, InitEvent } from '../Feature'
import feedRouter from './feedRoutes'
import { resetStorage } from './resetStorage'
import { S3Bucket, FEED_FOLDER } from './S3Bucket'

export class FeedsFeature implements Feature {
  bucket = new S3Bucket(FEED_FOLDER)

  name = 'feed'

  getRoutes (): [string, Router] {
    return ['feed', feedRouter]
  }

  getModelPaths (): string[] {
    return []
  }

  async init (after: InitEvent): Promise<void> {
    if (after === InitEvent.AFTER_DB) {
      await resetStorage(this.bucket)
    }
  }

  async reset (): Promise<void> {
    await resetStorage(this.bucket)
  }
}
