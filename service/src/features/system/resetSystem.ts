import { StateCase } from '@/features/senders/StateCase'
import { StateCaseTimeSeries } from '../senders/StateCaseTimeSeries'
import { getLogger } from '@/utils/loggers'
import { FeedBucket } from '@/epicast/FeedBucket'
import { CDCCase } from '@/features/receivers/CDCCase'
import { resetStorage } from '../feeds/resetStorage'

export const logger = getLogger('RESET_SYSTEM')
const daysOfFakeCasesOnReset = 1
const fakesPerDayOnReset = 5

export async function resetSystem(timeseries: StateCaseTimeSeries, feed: FeedBucket): Promise<void> {
  logger.debug('Resetting the database')
  await StateCase.destroy({
    truncate: true
  })
  await CDCCase.destroy({
    truncate: true
  })
  await resetStorage(feed)
  logger.info('Reseting the state schema')
  timeseries.resetSchema()
  logger.info('Adding a few fakes')
  await timeseries.insertFakeStateCases(daysOfFakeCasesOnReset, fakesPerDayOnReset)
}


