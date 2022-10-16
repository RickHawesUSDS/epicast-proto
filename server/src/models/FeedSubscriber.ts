import { TimeSeries, TimeSeriesMutator } from "@/models/TimeSeries"

export class FeedSubscriber {
  model: FeedSubscriberModel = { automatic: false }
  timeSeries: TimeSeries & TimeSeriesMutator

  constructor(timeSeries: TimeSeries & TimeSeriesMutator) {
    this.timeSeries = timeSeries
  }

  update(newModel: FeedSubscriberModel): FeedSubscriberModel {
    this.model = newModel
    return this.model
  }
}

export interface FeedSubscriberModel {
  readonly automatic: boolean
  readonly lastChecked?: Date
}
