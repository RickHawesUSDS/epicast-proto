import YAML from "yaml";
import { isAfter } from 'date-fns'
import { getLogger } from "log4js";

import { MutableTimeSeries } from "@/models/TimeSeries";
import { FeedBucket } from "@/models/FeedBucket";
import { FeedSchema } from '@/models/FeedSchema';
import { SCHEMA_FOLDER } from "@/models/feedBucketKeys";


const logger = getLogger('READ_SCHEMA_SERVICE')

export async function readSchema<T>(fromBucket: FeedBucket, mutatingTimeSeries: MutableTimeSeries<T>): Promise<void> {
  const publishedBlobKey = await findLastSchemaKey(fromBucket, mutatingTimeSeries.schema.validFrom)
  if (publishedBlobKey === null) return
  logger.info('Reading schema: $0', publishedBlobKey)

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
