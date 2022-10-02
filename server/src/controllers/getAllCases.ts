import { StateCase } from "@/models/StateCase"
import { getLogger } from '@/utils/loggers';

const logger = getLogger('GET_ALL_CASES');

export async function getAllCases(): Promise<StateCase[]> {
    logger.debug("Get all cases")
    const cases = await StateCase.findAll()
    return cases
}