import { StateCase } from '@/models/StateCase'
import { StateCaseTimeSeries } from '../services/StateCaseTimeSeries'
import { getLogger } from '@/utils/loggers'
import { Feed } from '@/utils/Feed'

const logger = getLogger('RESET_SYSTEM')
const daysOfFakeCasesOnReset = 3
const fakesPerDayOnReset = 5

export async function resetSystem (timeseries: StateCaseTimeSeries, feed: Feed): Promise<void> {
  logger.debug('Resetting the database')
  await StateCase.destroy({
    truncate: true
  })
  await resetStorage(feed)
  logger.info('Adding a few fakes')
  await timeseries.insertFakeStateCases(daysOfFakeCasesOnReset, fakesPerDayOnReset)
}

export async function resetStorage (feed: Feed): Promise<void> {
  logger.info('Resetting storage')
  const s3Objects = await feed.listObjects('')
  for (const s3Object of s3Objects) {
    const key = s3Object.Key
    if (key !== undefined) await feed.deleteObject(key)
  }
}
