import { FeedBucket } from '@/epicast/FeedBucket'
import { SnapshotReader } from '@/epicast/Snapshot'
import { MutableTimeSeries } from '@/epicast/TimeSeries'
import { readSchema } from './readSchema'
import { readTimeSeries } from './readTimeSeries'

export async function readFeed<T>(fromBucket: FeedBucket, timeSeries: MutableTimeSeries<T>): Promise<Date | undefined> {
  const fromSnapshot = new SnapshotReader(fromBucket)
  await fromSnapshot.read()
  await readSchema(fromSnapshot, timeSeries)
  return await readTimeSeries(fromSnapshot, timeSeries)
}
