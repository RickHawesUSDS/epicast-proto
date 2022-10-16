import { readFileSync } from 'fs'
import { getLogger } from 'log4js'
import { formatISO } from 'date-fns'
import { compile } from 'handlebars'

import { Bucket } from '@/models/Bucket'
import { FeedLog } from './FeedLog'
import { FeedSchema } from '@/models/FeedSchema'

const logger = getLogger('PUBLISH_SCHEMA_SERVICE')
export const SCHEMA_FOLDER = 'schema'
export const SCHEMA_EXTENSION = 'yaml'
const SCHEMA_TEMPLATE_PATH = './src/public/epicast-demoserver-feed1-schema.handlebars'

export async function publishSchema(bucket: Bucket, schema: FeedSchema, log: FeedLog): Promise<void> {
  const schemaKey = formSchemaKey(schema)
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

export function formSchemaKey(schema: FeedSchema): string {
  const validFrom = formatISO(schema.validFrom, { format:'basic', representation:'complete' })
  return `${SCHEMA_FOLDER}/${schema.organizationId}-${schema.systemId}-${schema.feedId}-${validFrom}.${SCHEMA_EXTENSION}`
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
