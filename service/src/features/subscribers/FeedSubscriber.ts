import { MutableTimeSeries } from '../../epicast/TimeSeries'
import { FeedStorage } from '../../epicast/FeedStorage'

export class FeedSubscriber<T> {
  model: FeedSubscriberModel = { automatic: false, reading: false, publishedAt: undefined }
  storage: FeedStorage
  timeSeries: MutableTimeSeries<T>
  timer: NodeJS.Timeout | undefined

  constructor(fromStorage: FeedStorage, toTimeSeries: MutableTimeSeries<T>) {
    this.storage = fromStorage
    this.timeSeries = toTimeSeries
  }

  startAutomatic(timer: NodeJS.Timeout): FeedSubscriber<T> {
    this.model = { ...this.model, automatic: true }
    this.timer = timer
    return this
  }

  stopAutomatic(): FeedSubscriber<T> {
    this.timer = undefined
    this.model = { ...this.model, automatic: false }
    return this
  }

  setReading(newReading: boolean, newPublishedAt?: Date): FeedSubscriber<T> {
    this.model = { ...this.model, reading: newReading }
    if (newPublishedAt !== undefined) {
      this.model = { ...this.model, publishedAt: newPublishedAt }
    }
    return this
  }
}

export interface FeedSubscriberModel {
  readonly automatic: boolean
  readonly reading?: boolean
  readonly publishedAt?: Date
}
