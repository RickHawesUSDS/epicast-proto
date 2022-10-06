import { db } from "../utils/db"
import { StateCase } from "@/models/StateCase"
import { insertManyFakeStateCases } from "../services/fakeStateCase"
import { getLogger } from '@/utils/loggers';

const logger = getLogger('RESET_SYSTEM');

export async function resetSystem() {
    logger.debug("Reset the demo database")
    await StateCase.destroy({
        truncate: true
    })
    await insertManyFakeStateCases(3)
}
