import { readFileSync } from 'fs'
import { getLogger } from 'log4js'
import { formatISO } from 'date-fns'
import { compile } from 'handlebars'

import { FeedBucket } from '@/models/FeedBucket'
import { formSchemaKey } from "@/models/feedBucketKeys"
import { PublishLog } from './PublishLog'
import { FeedSchema } from '@/models/FeedSchema'

const logger = getLogger('PUBLISH_SCHEMA_SERVICE')
const SCHEMA_TEMPLATE_PATH = './src/public/epicast-demoserver-feed1-schema.handlebars'

export async function publishSchema(bucket: FeedBucket, schema: FeedSchema, log: PublishLog): Promise<void> {
  const schemaKey = formSchemaKey(schema.organizationId, schema.systemId, schema.feedId, schema.validFrom)
  if (!await bucket.doesObjectExist(schemaKey)) {
    logger.info('publishing schema')
    const schemaTemplate = readFileSync(SCHEMA_TEMPLATE_PATH, { encoding: 'utf8' })
    const compiledSchemaTemplate = compile(schemaTemplate)
    const templateContext = formTemplateContext(schema)
    const rawSchema = compiledSchemaTemplate(templateContext)
    await bucket.putObject(schemaKey, rawSchema)
    log.add(schemaKey)
  }
}

function formTemplateContext(schema: FeedSchema): any {
  // format stuff in the way that the YAML file wants
  return {
    organizationId: schema.organizationId,
    systemId: schema.systemId,
    feedId: schema.feedId,
    validFrom: formatISO(schema.validFrom),
    elements: schema.elements
  }
}
