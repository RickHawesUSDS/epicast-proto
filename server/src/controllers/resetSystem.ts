import { StateCase } from '@/models/StateCase'
import { insertFakeStateCases } from '../services/stateCases'
import { getLogger } from '@/utils/loggers'
import { S3Feed } from '@/utils/bucket'

const logger = getLogger('RESET_SYSTEM')
const daysOfFakeCasesOnReset = 3
const fakesPerDayOnReset = 5

export async function resetSystem(): Promise<void> {
  logger.debug('Resetting the database')
  await StateCase.destroy({
    truncate: true
  })
  await resetStorage()
  logger.info('Adding a few fakes')
  await insertFakeStateCases(daysOfFakeCasesOnReset, fakesPerDayOnReset)
}

export async function resetStorage(): Promise<void> {
  logger.info('Resetting storage')
  const feed = new S3Feed()
  const s3Objects = await feed.listObjects('')
  for (const s3Object of s3Objects) {
    const key = s3Object.Key
    if (key !== undefined) await feed.deleteObject(key)
  }
}
