import { getLogger } from '@/utils/loggers'
import { readFileSync } from 'fs'
import { compile } from 'handlebars'
import { SUMMARY_KEY } from './feedStorageKeys'
import { updateFeedSummary } from './FeedSummary'
import { SnapshotMutator } from './Snapshot'
import { TimeSeries } from './TimeSeries'

const logger = getLogger('PUBLISH_DICTIONARY_SERVICE')
const SUMMARY_TEMPLATE_PATH = './public/summary.handlebars'

export async function publishSummary (toSnapshot: SnapshotMutator, timeSeries: TimeSeries): Promise<void> {
  logger.info('publishing feed summary')
  const timeSeriesMetadata = await timeSeries.fetchMetadata()
  const feedSummary = timeSeriesMetadata !== null ? updateFeedSummary(timeSeries.summary, timeSeriesMetadata) : timeSeries.summary
  const summaryTemplate = readFileSync(SUMMARY_TEMPLATE_PATH, { encoding: 'utf8' })
  const compiledSummaryTemplate = compile(summaryTemplate)
  const rawSummary = compiledSummaryTemplate(feedSummary)
  await toSnapshot.putObject(SUMMARY_KEY, rawSummary)
}
