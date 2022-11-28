import { TimeSeries } from './TimeSeries'
import { FeedStorage } from './FeedStorage'
import { publishDictionary } from './publishDictionary'
import { publishTimeseries } from './publishTimeSeries'
import { publishAggregates } from './publishAggregates'
import { publishSummary } from './publishSummary'
import { SnapshotWriter } from './Snapshot'

export async function publishFeed<T> (toStorage: FeedStorage, timeSeries: TimeSeries<T>): Promise<void> {
  const toSnapshot = new SnapshotWriter(toStorage)
  await toSnapshot.initialize()
  await publishDictionary(toSnapshot, timeSeries.dictionary)
  const objectsPublished = await publishTimeseries(toSnapshot, timeSeries)
  if (objectsPublished > 0) {
    await publishAggregates(toSnapshot, timeSeries)
    await publishSummary(toSnapshot, timeSeries)
    // other stuff defined later goes here
  }
  // Dev Note: publish will not create a new snapshot if there haven't been any changes
  await toSnapshot.publish()
}
