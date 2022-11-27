import { FeedStorage } from '@/epicast/FeedStorage'
import { SnapshotReader } from '@/epicast/Snapshot'
import { MutableTimeSeries } from '@/epicast/TimeSeries'
import { readDictionary } from './readDictionary'
import { readTimeSeries } from './readTimeSeries'

export async function readFeed<T> (fromStorage: FeedStorage, timeSeries: MutableTimeSeries<T>): Promise<Date | undefined> {
  const fromSnapshot = new SnapshotReader(fromStorage)
  await fromSnapshot.read()
  await readDictionary(fromSnapshot, timeSeries)
  return await readTimeSeries(fromSnapshot, timeSeries)
}
