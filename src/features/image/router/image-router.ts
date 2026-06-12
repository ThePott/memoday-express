import express, { type Router } from "express"

const imageRouter: Router = express.Router()

imageRouter.post("/", async (_req, res) => {
    res.status(200).send("---- post image response placeholder")
})

export default imageRouter
