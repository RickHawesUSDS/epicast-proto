import { TimeSeries } from "@/models/TimeSeries"
import { FeedBucket } from "@/models/FeedBucket"
import { PublishLog } from "./PublishLog"
import { publishSchema } from "./publishSchema"
import { publishTimeseries } from "./publishTimeSeries"

export async function publishFeed<T>(toBucket: FeedBucket, timeSeries: TimeSeries<T>): Promise<void> {
  const log = new PublishLog()
  await publishSchema(toBucket, timeSeries.schema, log)
  await publishTimeseries(toBucket, timeSeries, log)
  await log.publish(toBucket)
}

