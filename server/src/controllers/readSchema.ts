import YAML from "yaml";
import { isAfter } from 'date-fns'

import { TimeSeries, TimeSeriesMutator } from "@/models/TimeSeries";
import { FeedBucket } from "@/models/FeedBucket";
import { FeedSchema } from '@/models/FeedSchema';
import { SCHEMA_FOLDER } from "@/models/feedBucketKeys";


export async function readSchema(fromBucket: FeedBucket, mutatingTimeSeries: TimeSeries & TimeSeriesMutator): Promise<void> {
  const publishedBlobKey = await findLastSchemaKey(fromBucket, mutatingTimeSeries.schema.validFrom)
  if (publishedBlobKey === null) return

  const publishedBlob = await fromBucket.getObject(publishedBlobKey)
  const newSchema = YAML.parse(publishedBlob) as FeedSchema

  mutatingTimeSeries.updateSchema(newSchema)
}

async function findLastSchemaKey(fromBucket: FeedBucket, afterDate: Date | null): Promise<string | null> {
  let objects = await fromBucket.listObjects(SCHEMA_FOLDER)
  if (objects.length === 0) return null

  if (afterDate !== null) {
    objects = objects.filter((object) => isAfter(object.lastModified, afterDate))
  }
  if (objects.length === 0) return null

  const lastSchema = objects.reduce((a, b) => isAfter(a.lastModified, b.lastModified) ? a : b)
  return lastSchema.key
}
