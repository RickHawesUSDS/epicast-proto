import { TimeSeries, TimeSeriesMutator } from "@/models/TimeSeries"

export class FeedSubscriber<T> {
  model: FeedSubscriberModel = { automatic: false }
  timeSeries: TimeSeries & TimeSeriesMutator<T>

  constructor(timeSeries: TimeSeries & TimeSeriesMutator<T>) {
    this.timeSeries = timeSeries
  }

  set(newModel: FeedSubscriberModel): FeedSubscriberModel {
    this.model = newModel
    return this.model
  }

  setLastChecked(): FeedSubscriberModel {
    this.model = { automatic: this.model.automatic, lastChecked: new Date()}
    return this.model
  }

  setAutomatic(automatic: boolean): FeedSubscriberModel {
    this.model = { automatic: automatic, lastChecked: this.model.lastChecked }
    return this.model
  }
}

export interface FeedSubscriberModel {
  readonly automatic: boolean
  readonly lastChecked?: Date
}
