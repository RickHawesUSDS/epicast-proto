import YAML from 'yaml'
import { isAfter, isSameSecond, parseISO } from 'date-fns'
import { getLogger } from '@/server/loggers'

import { MutableTimeSeries } from './TimeSeries'
import { FeedSummary } from './FeedSummary'
import { SUMMARY_KEY } from './feedStorageKeys'
import { Snapshot } from './Snapshot'

const logger = getLogger('READ_SUMMARY_SERVICE')

export async function readSummary<T>(fromSnapshot: Snapshot, toTimeSeries: MutableTimeSeries<T>): Promise<void> {
  if (!fromSnapshot.doesObjectExist(SUMMARY_KEY)) return
  const publishedBlob = await fromSnapshot.getObject(SUMMARY_KEY)
  const newSummary = YAML.parse(publishedBlob) as FeedSummary
  toTimeSeries.updateSubscriberSummary(newSummary)
  logger.info(`Read ${newSummary.reporterId} summary`)
}
