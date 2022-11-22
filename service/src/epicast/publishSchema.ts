import { readFileSync } from 'fs'
import { getLogger } from 'log4js'
import { formatISO } from 'date-fns'
import { compile } from 'handlebars'

import { formSchemaKey } from './feedBucketKeys'
import { FeedSchema } from './FeedSchema'
import { filterElements } from './FeedElement'
import { MutableSnapshot } from './Snapshot'

const logger = getLogger('PUBLISH_SCHEMA_SERVICE')
const SCHEMA_TEMPLATE_PATH = './public/epicast-demoserver-feed1-schema.handlebars'

export async function publishSchema (toSnapshot: MutableSnapshot, schema: FeedSchema): Promise<void> {
  const schemaKey = formSchemaKey(schema.subjectId, schema.reporterId, schema.topicId, schema.validFrom)
  if (!toSnapshot.doesObjectExist(schemaKey)) {
    logger.info('publishing schema')
    const schemaTemplate = readFileSync(SCHEMA_TEMPLATE_PATH, { encoding: 'utf8' })
    const compiledSchemaTemplate = compile(schemaTemplate)
    const templateContext = formTemplateContext(schema)
    const rawSchema = compiledSchemaTemplate(templateContext)
    await toSnapshot.putObject(schemaKey, rawSchema)
  }
}

function formTemplateContext (schema: FeedSchema): any {
  const deidentifiedElements = filterElements(schema.elements, 'pii')
  // format stuff in the way that the YAML file wants
  return {
    subjectId: schema.subjectId,
    reporterId: schema.reporterId,
    feedId: schema.topicId,
    validFrom: formatISO(schema.validFrom),
    elements: deidentifiedElements
  }
}
