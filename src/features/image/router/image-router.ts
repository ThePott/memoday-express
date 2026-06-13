import express, { type Router } from "express"
import { readdirSync, readFileSync } from "fs"
import multer from "multer"
const upload = multer({ dest: "./uploads/" })

const imageRouter: Router = express.Router()

imageRouter.get("/", async (_req, res) => {
    const files = readdirSync("uploads")
    const sampleImage = readFileSync(`uploads/${files[0]}`)
    res.contentType("image/jpeg")
    res.status(200).send(sampleImage)
})

const uploadMiddleware = upload.single("image")
imageRouter.post("/", uploadMiddleware, async (req, res) => {
    const file = req.file
    if (!file) {
        res.status(400).json({ message: "---- post memory payload invalid" })
        return
    }

    const image = file
    const { date, front_message, rear_message } = req.body
    console.log({ image, date, front_message, rear_message })
    console.log("---- image posted")
    res.status(200).send("---- post image response placeholder")
})

export default imageRouter
