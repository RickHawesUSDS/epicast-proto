import YAML from 'yaml'
import { isAfter } from 'date-fns'
import { getLogger } from 'log4js'

import { MutableTimeSeries } from './TimeSeries'
import { FeedDictionaryYaml, fromYaml } from './FeedDictionary'
import { DICTIONARY_FOLDER } from './feedStorageKeys'
import { Snapshot } from './Snapshot'

const logger = getLogger('READ_DICTIONARY_SERVICE')

export async function readDictionary<T> (fromSnapshot: Snapshot, mutatingTimeSeries: MutableTimeSeries<T>): Promise<void> {
  const publishedBlobKey = findLastDictionaryKey(fromSnapshot, mutatingTimeSeries.dictionary.validFrom)
  if (publishedBlobKey === null) return
  logger.info('Reading dictionary: $0', publishedBlobKey)

  const publishedBlob = await fromSnapshot.getObject(publishedBlobKey)
  const newDictionary = fromYaml(YAML.parse(publishedBlob) as FeedDictionaryYaml)

  mutatingTimeSeries.updateDictionary(newDictionary)
}

function findLastDictionaryKey (fromSnapshot: Snapshot, afterDate: Date | null): string | null {
  let objects = fromSnapshot.listObjects(DICTIONARY_FOLDER)
  if (objects.length === 0) {
    logger.debug(`No dictionaries in ${fromSnapshot.uri}`)
    return null
  }
  if (objects.length === 1) {
    return objects[0].key
  }
  if (afterDate !== null) {
    objects = objects.filter((object) => isAfter(object.lastModified, afterDate))
  }
  if (objects.length === 0) return null
  const lastDictionary = objects.reduce((a, b) => isAfter(a.lastModified, b.lastModified) ? a : b)
  return lastDictionary.key
}
