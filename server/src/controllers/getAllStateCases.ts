import { StateCase } from '@/models/StateCase'
import { getLogger } from '@/utils/loggers'
import { findAllStateCases } from '@/services/stateCaseService'

const logger = getLogger('GET_ALL_CASES')

export async function getAllStateCases (sortDescending: boolean): Promise<StateCase[]> {
  // TODO: Do I need a controller?
  logger.debug('Get all state cases')
  return await findAllStateCases(sortDescending)
}
