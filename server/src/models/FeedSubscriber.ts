import { MutableTimeSeries } from "@/models/TimeSeries"
import { FeedBucket } from "./FeedBucket"

export class FeedSubscriber<T> {
  model: FeedSubscriberModel = { automatic: false }
  bucket: FeedBucket
  timeSeries: MutableTimeSeries<T>
  timer : NodeJS.Timeout | undefined

  constructor(fromBucket: FeedBucket, toTimeSeries: MutableTimeSeries<T>) {
    this.bucket = fromBucket
    this.timeSeries = toTimeSeries
  }

  setLastChecked(): FeedSubscriber<T> {
    this.model = { automatic: this.model.automatic, lastChecked: new Date()}
    return this
  }

  startAutomatic(timer: NodeJS.Timeout): FeedSubscriber<T> {
    this.model = { automatic: true, lastChecked: this.model.lastChecked }
    this.timer = timer
    return this
  }

  stopAutomatic(): FeedSubscriber<T> {
    this.timer = undefined
    this.model = { automatic: false, lastChecked: this.model.lastChecked }
    return this
  }
}

export interface FeedSubscriberModel {
  readonly automatic: boolean
  readonly lastChecked?: Date
}
