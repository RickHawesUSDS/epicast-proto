import { db } from "../utils/db"
import { insertFakeStateCases } from "../services/fakeStateCase"

async function resetDemo() {
    await db.sync()
    await insertFakeStateCases(new Date(), 3)
    console.log("Reset Demo")
}

export default resetDemo     