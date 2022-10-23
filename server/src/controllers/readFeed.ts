import { FeedBucket } from '@/models/FeedBucket'
import { MutableTimeSeries } from '@/models/TimeSeries'
import { readSchema } from './readSchema'
import { readTimeSeries } from './readTimeSeries'

export async function readFeed<T> (fromBucket: FeedBucket, timeSeries: MutableTimeSeries<T>): Promise<Date | undefined> {
  await readSchema(fromBucket, timeSeries)
  return await readTimeSeries(fromBucket, timeSeries)
}
