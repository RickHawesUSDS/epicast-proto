import { FeedBucket } from '@/models/FeedBucket'
import { MutableTimeSeries } from '@/models/TimeSeries'
import { readSchema } from './readSchema'
import { readTimeSeries } from './readTimeSeries'
import { VERSION_MARKER } from '@/models/feedBucketKeys'

export async function readFeed<T>(fromBucket: FeedBucket, timeSeries: MutableTimeSeries<T>): Promise<Date | undefined> {
  return readConsistently(fromBucket, timeSeries, async () => {
    await readSchema(fromBucket, timeSeries)
    return await readTimeSeries(fromBucket, timeSeries)
  })
}

async function readConsistently<T>(fromBucket: FeedBucket, timeSeries: MutableTimeSeries<T>, action: () => Promise<Date | undefined>) {
  const versionMarkerExists = await fromBucket.doesObjectExist(VERSION_MARKER)
  if (!versionMarkerExists) return undefined

  const versionMarkerBeforeRaw = await fromBucket.getObject(VERSION_MARKER)
  const versionMarkerBefore = JSON.parse(versionMarkerBeforeRaw)
  if (versionMarkerBefore.updating as boolean) return undefined // don't read an updating feed

  // do it
  const lastUpdateAt = await action()

  const versionMarkerAfterRaw = await fromBucket.getObject(VERSION_MARKER)
  const versionMarkerAfter = JSON.parse(versionMarkerAfterRaw)
  if (versionMarkerAfter.updating as boolean && versionMarkerAfter.version !== versionMarkerBefore.version) return undefined

  return lastUpdateAt
}
