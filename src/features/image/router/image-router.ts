import express, { type Router } from "express"
import sharp from "sharp"
import { readdirSync, readFileSync } from "fs"
import multer from "multer"
import s3Client from "../../../shared/config/s3-client.js"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { findDominantColor } from "./operations/find-dominant-color.js"
import { BUCKET_NAME } from "../../../shared/config/env-var.js"

const upload = multer({ dest: "./uploads/" })

const imageRouter: Router = express.Router()

imageRouter.get("/", async (_req, res) => {
    // const files = readdirSync("uploads")
    // const sampleImage = readFileSync(`uploads/${files[0]}`)
    // res.contentType("image/jpeg")
    // res.status(200).send(sampleImage)
    res.status(200).send("---- good")
})

const uploadMiddleware = upload.single("image")
imageRouter.post("/", uploadMiddleware, async (req, res) => {
    const original = req.file
    if (!original) {
        res.status(400).json({ message: "---- post memory payload invalid" })
        return
    }
    const originalBuffer = original.buffer

    const dominantColorPromise = findDominantColor(originalBuffer)
    const thumbnailBufferPromise = sharp(originalBuffer)
        .resize({
            width: 200,
            height: 200,
            fit: "cover",
        })
        .toFormat("jpeg", { quality: 80 })
        .toBuffer()
    const [dominantColor, thumbnailBuffer] = await Promise.all([dominantColorPromise, thumbnailBufferPromise])

    const filename = original.filename
    const originalKey = `originals/${filename}`
    const thumbnailKey = `thumbnails/${filename}`

    const originalSendPromise = s3Client.send(
        new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: originalKey,
            Body: original.buffer,
            ContentType: "image/jpeg",
        }),
    )
    const thumbnailSendPromise = s3Client.send(
        new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: thumbnailKey,
            Body: thumbnailBuffer,
            ContentType: "image/jpeg",
        }),
    )
    await Promise.all([originalSendPromise, thumbnailSendPromise])

    // this is for debug
    const { date, front_message, rear_message } = req.body
    // TODO: I need to store this info to db
    console.log({ dominantColor, originalKey, thumbnailKey, date, front_message, rear_message })
    res.status(200).json({ dominantColor, originalKey, thumbnailKey, date, front_message, rear_message })
})

export default imageRouter
