import { TimeSeries } from "@/models/TimeSeries"
import { Bucket } from "@/models/Bucket"
import { PublishLog } from "./PublishLog"
import { publishSchema } from "./publishSchema"
import { publishTimeseries } from "./publishTimeSeries"

export async function publishFeed(toBucket: Bucket, timeSeries: TimeSeries): Promise<void> {
  const log = new PublishLog()
  await publishSchema(toBucket, timeSeries.schema, log)
  await publishTimeseries(toBucket, timeSeries, log)
  await log.publish(toBucket)
}

