import express, { type Router } from "express"
import { extractAppUserId } from "../../shared/utils/decode-jwt-in-headers.js"
import db from "../../shared/config/db.js"
import { app_user } from "../../db/schema.js"
import { eq } from "drizzle-orm"

const accountRouter: Router = express.Router()

accountRouter.delete("/", async (req, res) => {
    const { app_user_id } = extractAppUserId(req.headers)
    const result = db.delete(app_user).where(eq(app_user.id, app_user_id)).returning()
    console.log({ message: "account deleted", result })
    res.status(204)
})

export default accountRouter
