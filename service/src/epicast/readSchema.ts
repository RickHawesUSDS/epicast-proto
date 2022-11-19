import YAML from 'yaml'
import { isAfter } from 'date-fns'
import { getLogger } from 'log4js'

import { MutableTimeSeries } from './TimeSeries'
import { FeedSchema } from './FeedSchema'
import { SCHEMA_FOLDER } from './feedBucketKeys'
import { Snapshot } from './Snapshot'

const logger = getLogger('READ_SCHEMA_SERVICE')

export async function readSchema<T>(fromSnapshot: Snapshot, mutatingTimeSeries: MutableTimeSeries<T>): Promise<void> {
  const publishedBlobKey = await findLastSchemaKey(fromSnapshot, mutatingTimeSeries.schema.validFrom)
  if (publishedBlobKey === null) return
  logger.info('Reading schema: $0', publishedBlobKey)

  const publishedBlob = await fromSnapshot.getObject(publishedBlobKey)
  const newSchema = YAML.parse(publishedBlob) as FeedSchema

  mutatingTimeSeries.updateSchema(newSchema)
}

async function findLastSchemaKey(fromSnapshot: Snapshot, afterDate: Date | null): Promise<string | null> {
  let objects = await fromSnapshot.listObjects(SCHEMA_FOLDER)
  if (objects.length === 0) return null
  if (objects.length === 1) {
    return objects[0].key
  }
  // bugs after here
  logger.debug(`objects  ${objects[0].lastModified.toISOString()}`)
  if (afterDate !== null) {
    objects = objects.filter((object) => isAfter(object.lastModified, afterDate))
  }
  if (objects.length === 0) return null

  logger.debug(`objects  ${objects[0].lastModified.toISOString()}`)
  const lastSchema = objects.reduce((a, b) => isAfter(a.lastModified, b.lastModified) ? a : b)
  return lastSchema.key
}
