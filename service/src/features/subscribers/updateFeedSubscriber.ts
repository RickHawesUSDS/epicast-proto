import { getLogger } from 'log4js'
import { FeedSubscriber, FeedSubscriberModel } from './FeedSubscriber'
import { readFeed } from '@/epicast/readFeed'

export const FIRST_TIMEOUT = 5000
export const REPEAT_TIMEOUT = 10000
const logger = getLogger('FEED_SUBSCRIBER_CONTROLLER')

export function updateFeedSubscriber<T>(feedSubscriber: FeedSubscriber<T>, newValue: FeedSubscriberModel): FeedSubscriberModel {
  if (newValue.automatic) {
    const timer = setTimeout(automaticReadFeed, FIRST_TIMEOUT, feedSubscriber)
    feedSubscriber.startAutomatic(timer)
  } else {
    clearTimeout(feedSubscriber.timer)
    feedSubscriber.stopAutomatic()
  }
  return feedSubscriber.model
}

function automaticReadFeed<T>(feedSubscriber: FeedSubscriber<T>): void {
  logger.info('Reading timeSeries automatically')
  feedSubscriber.setReading(true)
  readFeed(feedSubscriber.storage, feedSubscriber.timeSeries).then((publishedAt) => {
    const timer = setTimeout(automaticReadFeed, REPEAT_TIMEOUT, feedSubscriber)
    feedSubscriber
      .setReading(false, publishedAt)
      .startAutomatic(timer)
    logger.debug('Feed reading success')
  }).catch((reason) => {
    const message = (reason as Error).message
    logger.error(`caught readFeed error: ${message}`)
  })
}
