import { FeedBucket } from '@/models/FeedBucket'
import { MutableTimeSeries } from '@/models/TimeSeries'
import { readSchema } from './readSchema'
import { readTimeSeries } from './readTimeSeries'
import { VERSION_MARKER } from '@/models/feedBucketKeys'

export async function readFeed<T>(fromBucket: FeedBucket, timeSeries: MutableTimeSeries<T>): Promise<Date | undefined> {
  const versionMarkerExists = await fromBucket.doesObjectExist(VERSION_MARKER)
  if (!versionMarkerExists) return undefined

  const versionMarkerBeforeRaw = await fromBucket.getObject(VERSION_MARKER)
  const versionMarkerBefore = JSON.parse(versionMarkerBeforeRaw)
  if (versionMarkerBefore.updating as boolean) return undefined // don't read an updating feed

  await readSchema(fromBucket, timeSeries)
  const lastUpdate = await readTimeSeries(fromBucket, timeSeries)

  const versionMarkerAfterRaw = await fromBucket.getObject(VERSION_MARKER)
  const versionMarkerAfter = JSON.parse(versionMarkerAfterRaw)
  if (versionMarkerAfter.updating as boolean && versionMarkerAfter.version !== versionMarkerBefore.version) return undefined
  return lastUpdate
}
