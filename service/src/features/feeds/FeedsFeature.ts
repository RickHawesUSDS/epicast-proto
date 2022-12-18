import { Router } from 'express'
import { Feature } from '@/server/Feature'
import { AppState } from '@/server/AppState'
import feedRouter from './feedRoutes'
import { resetStorage } from './resetStorage'
import { S3FeedStorage } from './S3FeedStorage'

export class FeedsFeature implements Feature {
  private storage?: S3FeedStorage

  name = 'feeds'

  getRoutes (): [string, Router] {
    return [this.name, feedRouter]
  }

  async init (state: AppState): Promise<void> {
    if (process.env.S3_BUCKET_NAME === undefined) throw Error('Missing S3_BUCKET_NAME in .env file')
    this.storage = new S3FeedStorage(state.s3Client, process.env.S3_BUCKET_NAME)
  }

  async reset (): Promise<void> {
    await resetStorage(this.feedStorage)
  }

  get feedStorage (): S3FeedStorage {
    if (this.storage === undefined) throw Error('FeedsFeature is uninitialized')
    return this.storage
  }
}
