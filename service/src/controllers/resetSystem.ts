import { StateCase } from '@/models/sequelizeModels/StateCase'
import { StateCaseTimeSeries } from '../models/StateCaseTimeSeries'
import { getLogger } from '@/utils/loggers'
import { FeedBucket } from '@/models/FeedBucket'
import { CDCCase } from '@/models/sequelizeModels/CDCCase'

const logger = getLogger('RESET_SYSTEM')
const daysOfFakeCasesOnReset = 1
const fakesPerDayOnReset = 5

export async function resetSystem (timeseries: StateCaseTimeSeries, feed: FeedBucket): Promise<void> {
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

export async function resetStorage (feed: FeedBucket): Promise<void> {
  logger.info('Resetting storage')
  const bucketObjects = await feed.listObjects('')
  for (const bucketObject of bucketObjects) {
    await feed.deleteObject(bucketObject.key)
  }
}
