import { _Object } from '@aws-sdk/client-s3'

import { publishSchema } from './publishSchema'
import { publishStateCaseTimeseries } from './publishTimeseries'
import { Feed } from '@/utils/Feed'
import { FeedLog } from './FeedLog'

export async function publishStateCaseFeed(feed: Feed): Promise<void> {
  const log = new FeedLog()
  await publishSchema(feed, log)
  await publishStateCaseTimeseries(feed, log)
  await log.publish(feed)
}

