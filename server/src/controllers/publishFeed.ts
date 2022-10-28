import { TimeSeries } from '@/models/TimeSeries'
import { FeedBucket } from '@/models/FeedBucket'
import { PublishLog } from './PublishLog'
import { publishSchema } from './publishSchema'
import { publishTimeseries } from './publishTimeSeries'
import { VERSION_MARKER } from '@/models/feedBucketKeys'
import { formVersionMarker } from '@/models/feedBucketKeys'

export async function publishFeed<T>(toBucket: FeedBucket, timeSeries: TimeSeries<T>): Promise<void> {
  const log = new PublishLog()

  // Note: the current protocol requires only one writer.
  let version = 0
  const isVersionAvailable = await toBucket.doesObjectExist(VERSION_MARKER)
  if (isVersionAvailable) {
    const versionRaw = await toBucket.getObject(VERSION_MARKER)
    version = JSON.parse(versionRaw)
  }
  
  // Mark the version file as being updated
  const versionMarkerRawUpdating = formVersionMarker(version, true)
  await toBucket.putObject(VERSION_MARKER, versionMarkerRawUpdating)

  // Add the stuff
  await publishSchema(toBucket, timeSeries.schema, log)
  await publishTimeseries(toBucket, timeSeries, log)
  await log.publish(toBucket)

  // Update the version marker
  const versionMarkerRaw = formVersionMarker(version + 1, false)
  await toBucket.putObject(VERSION_MARKER, versionMarkerRaw)
}
