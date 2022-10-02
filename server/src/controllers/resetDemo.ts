import { db } from "../utils/db"
import { StateCase } from "@/models/StateCase"
import { insertFakeStateCases } from "../services/fakeStateCase"

async function resetDemo() {
    await db.sync()
    await StateCase.destroy({
        truncate: true
    })
    await insertFakeStateCases(new Date(), 3)
    console.log("Reset Demo")
}

export default resetDemo     