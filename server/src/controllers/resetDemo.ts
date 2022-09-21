import { db } from "../utils/db"

function resetDemo() {
    db.sync()
    console.log("reset Demo")
}

export default resetDemo     