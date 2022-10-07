import { StateCase } from "@/models/StateCase"
import { getLogger } from '@/utils/loggers';

const logger = getLogger('GET_ALL_CASES');

export async function getAllStateCases(order: string): Promise<StateCase[]> {
    logger.debug("Get all state cases")
    const listOrder = order === "oldest" ? "ASC" : "DESC"
    const cases = await StateCase.findAll({
      order: [
        ["onsetOfSymptoms", listOrder],
      ]
    })
    return cases
}
