import { TimeSeries } from './TimeSeries'
import { FeedStorage } from './FeedStorage'
import { publishDictionary } from './publishDictionary'
import { publishTimeseries } from './publishTimeSeries'
import { SnapshotWriter } from './Snapshot'
import { publishAggregates } from './publishAggregates'

export async function publishFeed<T> (toStorage: FeedStorage, timeSeries: TimeSeries<T>): Promise<void> {
  const toSnapshot = new SnapshotWriter(toStorage)
  await toSnapshot.initialize()
  await publishDictionary(toSnapshot, timeSeries.dictionary)
  const objectsPublished = await publishTimeseries(toSnapshot, timeSeries)
  if (objectsPublished > 0) {
    await publishAggregates(toSnapshot, timeSeries)
  }
  // other stuff defined later goes here
  await toSnapshot.publish()
}
