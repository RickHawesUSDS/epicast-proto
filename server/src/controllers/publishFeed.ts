import { TimeSeries } from '@/models/TimeSeries'
import { FeedBucket } from '@/models/FeedBucket'
import { publishSchema } from './publishSchema'
import { publishTimeseries } from './publishTimeSeries'
import { SnapshotWriter } from '@/models/Snapshot'
import { publishAggregates } from './publishAggregates'

export async function publishFeed<T> (toBucket: FeedBucket, timeSeries: TimeSeries<T>): Promise<void> {
  const toSnapshot = new SnapshotWriter(toBucket)
  await toSnapshot.initialize()
  await publishSchema(toSnapshot, timeSeries.schema)
  const objectsPublished = await publishTimeseries(toSnapshot, timeSeries)
  if (objectsPublished > 0) {
    await publishAggregates(toSnapshot, timeSeries)
  }
  // other stuff defined later goes here
  await toSnapshot.publish()
}
