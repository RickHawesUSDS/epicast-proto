import { MutableTimeSeries } from '../../epicast/TimeSeries'
import { FeedSummary } from '@/epicast/FeedSummary'
import { FeedStorage } from '../../epicast/FeedStorage'
import { MongoTimeSeriesEvent } from './MongoTimeSeries'
import { readFeed } from '@/epicast/readFeed'
import { getLogger } from '@/utils/loggers'
import { formFolder } from '@/epicast/feedStorageKeys'

const logger = getLogger('FEED_SUBSCRIBER')
const FIRST_TIMEOUT = 5000
const REPEAT_TIMEOUT = 10000

export interface FeedSubscriberModel {
  readonly name: string
  readonly automatic: boolean
  readonly reading?: boolean
  readonly publishedAt?: Date
}

export class FeedSubscriber {
  model: FeedSubscriberModel
  fromFolder: string
  storage?: FeedStorage
  timeSeries: MutableTimeSeries<MongoTimeSeriesEvent>
  timer: NodeJS.Timeout | undefined

  constructor (
    fromFeed: FeedSummary,
    toTimeSeries: MutableTimeSeries<MongoTimeSeriesEvent>
  ) {
    this.model = {
      name: `${fromFeed.topicId}.${fromFeed.reporterId}`,
      automatic: false,
      reading: false,
      publishedAt: undefined
    }
    this.fromFolder = formFolder(fromFeed)
    this.timeSeries = toTimeSeries
  }

  setStorage (storage: FeedStorage): void {
    this.storage = storage
  }

  startAutomatic (): FeedSubscriber {
    this.model = { ...this.model, automatic: true }
    this.timer = setTimeout(FeedSubscriber.backgroundReadFeed, FIRST_TIMEOUT, this)
    return this
  }

  stopAutomatic (): FeedSubscriber {
    if (this.timer !== undefined) {
      clearTimeout(this.timer)
    }

    this.timer = undefined
    this.model = { ...this.model, automatic: false }
    return this
  }

  continueAutomatic (): FeedSubscriber {
    this.timer = setTimeout(FeedSubscriber.backgroundReadFeed, REPEAT_TIMEOUT, this)
    return this
  }

  setReading (newReading: boolean, newPublishedAt?: Date): FeedSubscriber {
    if (newPublishedAt !== undefined) {
      this.model = { ...this.model, reading: newReading, publishedAt: newPublishedAt }
    } else {
      this.model = { ...this.model, reading: newReading }
    }
    return this
  }

  updateFeedSubscriber (newValue: FeedSubscriberModel): FeedSubscriberModel {
    if (newValue.automatic && !this.model.automatic) {
      this.startAutomatic()
    }
    if (!newValue.automatic && this.model.automatic) {
      this.stopAutomatic()
    }
    return this.model
  }

  async readOnce (): Promise<FeedSubscriberModel> {
    if (this.storage === undefined) return this.model

    logger.info(`Reading ${this.model.name} timeSeries once`)
    this.setReading(true)
    const publishedAt = await readFeed(
      this.storage,
      this.fromFolder,
      this.timeSeries
    )
    this.setReading(false, publishedAt)
    return this.model
  }

  // Background reading of the feed uses this function
  static backgroundReadFeed (feedSubscriber: FeedSubscriber): void {
    if (feedSubscriber.storage === undefined) return

    logger.info(`Reading feed ${feedSubscriber.model.name} in background`)
    feedSubscriber.setReading(true)
    const readFeedPromise = readFeed(
      feedSubscriber.storage,
      feedSubscriber.fromFolder,
      feedSubscriber.timeSeries
    )
    readFeedPromise.then(publishedAt => {
      feedSubscriber
        .setReading(false, publishedAt)
        .continueAutomatic()
      logger.debug(`Feed ${feedSubscriber.model.name} reading successful`)
    }).catch(reason => {
      const message = (reason as Error).message
      logger.error(`caught readFeed error: ${message}`)
    })
  }
}
