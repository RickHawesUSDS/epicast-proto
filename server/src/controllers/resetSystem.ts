import { StateCase } from '@/models/sequelizeModels/StateCase'
import { StateCaseTimeSeries } from '../services/StateCaseTimeSeries'
import { getLogger } from '@/utils/loggers'
import { Bucket } from '@/models/Bucket'

const logger = getLogger('RESET_SYSTEM')
const daysOfFakeCasesOnReset = 3
const fakesPerDayOnReset = 5

export async function resetSystem(timeseries: StateCaseTimeSeries, feed: Bucket): Promise<void> {
  logger.debug('Resetting the database')
  await StateCase.destroy({
    truncate: true
  })
  await resetStorage(feed)
  logger.info('Adding a few fakes')
  await timeseries.insertFakeStateCases(daysOfFakeCasesOnReset, fakesPerDayOnReset)
}

export async function resetStorage(feed: Bucket): Promise<void> {
  logger.info('Resetting storage')
  const bucketObjects = await feed.listObjects('')
  for (const bucketObject of bucketObjects) {
    await feed.deleteObject(bucketObject.key)
  }
}
