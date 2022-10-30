import { TimeSeries } from '@/models/TimeSeries'
import { FeedBucket } from '@/models/FeedBucket'
import { publishSchema } from './publishSchema'
import { publishTimeseries } from './publishTimeSeries'
import { SnapshotWriter } from '@/models/Snapshot'

export async function publishFeed<T> (toBucket: FeedBucket, timeSeries: TimeSeries<T>): Promise<void> {
  const toSnapshot = new SnapshotWriter(toBucket)
  await toSnapshot.initialize()
  await publishSchema(toSnapshot, timeSeries.schema)
  await publishTimeseries(toSnapshot, timeSeries)
  // other stuff defined later goes here
  await toSnapshot.publish()
}
