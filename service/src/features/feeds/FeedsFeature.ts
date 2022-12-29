import { Router } from 'express'
import { Feature } from '@/server/Feature'
import { AppState } from '@/server/AppState'
import feedRouter from './feedRoutes'
import { resetStorage } from './resetStorage'
import { S3FeedStorage } from './S3FeedStorage'
import { LocalFeedStorage } from './LocalFeedStorage'
import { FeedStorage } from '@/epicast/FeedStorage'

export class FeedsFeature implements Feature {
  private storage?: FeedStorage

  name = 'feeds'
  collectionsUsed = []

  getRoutes (): [string, Router] {
    return [this.name, feedRouter]
  }

  async start (state: AppState): Promise<void> {
    if ('local'.localeCompare(process.env.FEED_STORAGE ?? 'local', 'en', { sensitivity: 'accent' }) === 0) {
      this.storage = new LocalFeedStorage()
    } else {
      if (process.env.S3_BUCKET === undefined) throw Error('Missing S3_BUCKET in .env file')
      this.storage = new S3FeedStorage(state.s3Client, process.env.S3_BUCKET)
    }
  }

  async stop (): Promise<void> {
  }

  async initializeStores (): Promise<void> {
  }

  async clearStores (): Promise<void> {
    await resetStorage(this.feedStorage)
  }

  get feedStorage (): FeedStorage {
    if (this.storage === undefined) throw Error('FeedsFeature is uninitialized')
    return this.storage
  }
}
