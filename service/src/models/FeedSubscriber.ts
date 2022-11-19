import { MutableTimeSeries } from '@/epicast/TimeSeries'
import { FeedBucket } from './FeedBucket'

export class FeedSubscriber<T> {
  model: FeedSubscriberModel = { automatic: false, lastChecked: undefined, reading: false, lastPublished: undefined }
  bucket: FeedBucket
  timeSeries: MutableTimeSeries<T>
  timer: NodeJS.Timeout | undefined

  constructor (fromBucket: FeedBucket, toTimeSeries: MutableTimeSeries<T>) {
    this.bucket = fromBucket
    this.timeSeries = toTimeSeries
  }

  setLastChecked (newLastPublished?: Date): FeedSubscriber<T> {
    this.model = { ...this.model, lastChecked: new Date() }
    if (newLastPublished !== undefined) {
      this.model = { ...this.model, lastPublished: newLastPublished }
    }
    return this
  }

  startAutomatic (timer: NodeJS.Timeout): FeedSubscriber<T> {
    this.model = { ...this.model, automatic: true }
    this.timer = timer
    return this
  }

  stopAutomatic (): FeedSubscriber<T> {
    this.timer = undefined
    this.model = { ...this.model, automatic: false }
    return this
  }

  setReading (newReading: boolean, newLastPublished?: Date): FeedSubscriber<T> {
    this.model = { ...this.model, reading: newReading }
    if (newLastPublished !== undefined) {
      this.model = { ...this.model, lastPublished: newLastPublished }
    }
    return this
  }
}

export interface FeedSubscriberModel {
  readonly automatic: boolean
  readonly lastChecked?: Date
  readonly reading?: boolean
  readonly lastPublished?: Date
}
