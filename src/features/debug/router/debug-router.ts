import express, { Router } from "express"

const router: Router = express.Router()

router.get("/", async (_req, res) => {
    console.log("---- debug called, hello world")
    res.status(200).send("---- hello world")
})

export default router
