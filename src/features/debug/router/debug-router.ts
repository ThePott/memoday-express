import express, { Router } from "express"

const router: Router = express.Router()

router.get("/", async (_req, res) => {
    res.status(200).send("---- hello world")
})

export default router
