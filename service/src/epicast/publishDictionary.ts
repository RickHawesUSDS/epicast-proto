import { readFileSync } from 'fs'
import { getLogger } from 'log4js'
import { formatISO } from 'date-fns'
import { compile } from 'handlebars'

import { formDictionaryKey } from './feedStorageKeys'
import { FeedDictionary } from './FeedDictionary'
import { filterElements } from './FeedElement'
import { MutableSnapshot } from './Snapshot'

const logger = getLogger('PUBLISH_DICTIONARY_SERVICE')
const DICTIONARY_TEMPLATE_PATH = './public/dictionary.handlebars'

export async function publishDictionary (toSnapshot: MutableSnapshot, dictionary: FeedDictionary): Promise<void> {
  const dictionaryKey = formDictionaryKey(dictionary.topic, dictionary.validFrom)
  if (!toSnapshot.doesObjectExist(dictionaryKey)) {
    logger.info('publishing data dictionary')
    const dictionaryTemplate = readFileSync(DICTIONARY_TEMPLATE_PATH, { encoding: 'utf8' })
    const compiledDictionaryTemplate = compile(dictionaryTemplate)
    const templateContext = formTemplateContext(dictionary)
    const rawDictionary = compiledDictionaryTemplate(templateContext)
    await toSnapshot.putObject(dictionaryKey, rawDictionary)
  }
}

function formTemplateContext (dictionary: FeedDictionary): any {
  const deidentifiedElements = filterElements(dictionary.elements, 'pii')
  // format stuff in the way that the YAML file wants
  return {
    topic: dictionary.topic,
    validFrom: formatISO(dictionary.validFrom),
    namespaces: dictionary.namespaces,
    elements: deidentifiedElements
  }
}
