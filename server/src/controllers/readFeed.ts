import { FeedBucket } from "@/models/FeedBucket"
import { TimeSeries, TimeSeriesMutator } from "@/models/TimeSeries";
import { readSchema } from "./readSchema";

export async function readFeed(fromBucket: FeedBucket, timeSeries: TimeSeries & TimeSeriesMutator): Promise<void> {
  await readSchema(fromBucket, timeSeries)

}
