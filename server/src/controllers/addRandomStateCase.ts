import { StateCase } from "@/models/StateCase"
import { getLogger } from '@/utils/loggers';
import { insertSingleFakeStateCase } from "@/services/fakeStateCase";

const logger = getLogger('ADD_RANDOM_STATE_CASE');

export async function addRandomStateCase(): Promise<StateCase> {
    logger.debug("Add random case")
    const stateCase = await insertSingleFakeStateCase()
    return stateCase
}
