import { readFileSync } from 'fs'
import { getLogger } from 'log4js'
import { formatISO } from 'date-fns'
import { compile } from 'handlebars'

import { formSchemaKey } from './feedBucketKeys'
import { FeedDictionary } from './FeedDictionary'
import { filterElements } from './FeedElement'
import { MutableSnapshot } from './Snapshot'

const logger = getLogger('PUBLISH_SCHEMA_SERVICE')
const SCHEMA_TEMPLATE_PATH = './public/epicast-demoserver-feed1-dictionary.handlebars'

export async function publishSchema (toSnapshot: MutableSnapshot, schema: FeedDictionary): Promise<void> {
  const schemaKey = formSchemaKey(schema.subjectId, schema.reporterId, schema.topicId, schema.validFrom)
  if (!toSnapshot.doesObjectExist(schemaKey)) {
    logger.info('publishing data dictionary')
    const schemaTemplate = readFileSync(SCHEMA_TEMPLATE_PATH, { encoding: 'utf8' })
    const compiledSchemaTemplate = compile(schemaTemplate)
    const templateContext = formTemplateContext(schema)
    const rawSchema = compiledSchemaTemplate(templateContext)
    await toSnapshot.putObject(schemaKey, rawSchema)
  }
}

function formTemplateContext (schema: FeedDictionary): any {
  const deidentifiedElements = filterElements(schema.elements, 'pii')
  // format stuff in the way that the YAML file wants
  return {
    subjectId: schema.subjectId,
    reporterId: schema.reporterId,
    topicId: schema.topicId,
    validFrom: formatISO(schema.validFrom),
    namespaces: schema.namespaces,
    elements: deidentifiedElements
  }
}
