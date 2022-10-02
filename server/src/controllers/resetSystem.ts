import { db } from "../utils/db"
import { StateCase } from "@/models/StateCase"
import { insertFakeStateCases } from "../services/fakeStateCase"
import { getLogger } from '@/utils/loggers';

const logger = getLogger('RESET_SYSTEM');

export async function resetSystem() {
    logger.debug("Reset the demo database")
    await StateCase.destroy({
        truncate: true
    })
    await insertFakeStateCases(new Date(), 3)
}