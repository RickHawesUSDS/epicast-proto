import { StateCase } from '@/models/StateCase'
import { insertFakeStateCases } from '../services/stateCaseService'
import { getLogger } from '@/utils/loggers'

const logger = getLogger('RESET_SYSTEM')
const daysOfFakeCasesOnReset = 3
const fakesPerDayOnReset = 5

export async function resetSystem (): Promise<void> {
  logger.debug('Reset the demo database')
  await StateCase.destroy({
    truncate: true
  })
  await insertFakeStateCases(daysOfFakeCasesOnReset, fakesPerDayOnReset)
}
