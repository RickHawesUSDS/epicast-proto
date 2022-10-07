import { StateCase } from "@/models/StateCase"
import { insertManyFakeStateCases } from "../services/stateCaseService"
import { getLogger } from '@/utils/loggers';

const logger = getLogger('RESET_SYSTEM');
const daysOfFakeCasesOnReset = 3

export async function resetSystem() {
    logger.debug("Reset the demo database")
    await StateCase.destroy({
        truncate: true
    })
    await insertManyFakeStateCases(daysOfFakeCasesOnReset)
}
