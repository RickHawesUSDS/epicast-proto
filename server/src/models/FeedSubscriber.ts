import { TimeSeries, TimeSeriesMutator } from "@/models/TimeSeries"

export class FeedSubscriber {
  model: FeedSubscriberModel = { automatic: false }
  timeSeries: TimeSeries & TimeSeriesMutator

  constructor(timeSeries: TimeSeries & TimeSeriesMutator) {
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
