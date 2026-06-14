import express, { type Router } from "express"
import sharp from "sharp"
import multer from "multer"
import s3Client from "../../../shared/config/s3-client.js"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { findDominantColor } from "./operations/find-dominant-color.js"
import { BUCKET_NAME } from "../../../shared/config/env-var.js"
import { memory } from "../../../db/schema.js"
import db from "../../../shared/config/db.js"
import { convertRgbToHexcode } from "../../../shared/utils/convert-color.js"
import { makeSerializable } from "../../../shared/utils/make-serializable.js"
import z from "zod"

const upload = multer()

const imageRouter: Router = express.Router()

imageRouter.get("/", async (_req, res) => {
    // const files = readdirSync("uploads")
    // const sampleImage = readFileSync(`uploads/${files[0]}`)
    // res.contentType("image/jpeg")
    // res.status(200).send(sampleImage)
    res.status(200).send("---- good")
})

const uploadMiddleware = upload.single("image")
const postImageReqBodySchema = z.object({
    date: z.string(),
    front_message: z.string().nullable(), // TODO: nullish maybe?
    rear_message: z.string().nullable(), // TODO: nullish maybe?
})
imageRouter.post("/", uploadMiddleware, async (req, res) => {
    const parseResult = postImageReqBodySchema.safeParse(req.body)
    if (parseResult.error) {
        res.status(400).json({ code: "INVALID BODY" })
        return
    }
    const { date, front_message, rear_message } = parseResult.data

    const original = req.file
    if (!original) {
        res.status(400).json({ message: "---- post memory payload invalid" })
        return
    }
    const originalBuffer = original.buffer

    const dominantRgbPromise = findDominantColor(originalBuffer)
    const thumbnailBufferPromise = sharp(originalBuffer)
        .resize({
            width: 200,
            height: 200,
            fit: "cover",
        })
        .toFormat("jpeg", { quality: 80 })
        .toBuffer()
    const [dominantRgb, thumbnailBuffer] = await Promise.all([dominantRgbPromise, thumbnailBufferPromise])
    console.log({ dominantColor: dominantRgb, thumbnailBuffer })

    const filename = original.originalname
    console.log({ filename })
    if (!filename) throw Error("---- filename empty")

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

    const dominantHexcode = convertRgbToHexcode(dominantRgb)

    const result = await db.insert(memory).values({
        date: date.slice(0, 10),
        dominant_color: dominantHexcode,
        front_message: front_message,
        rear_message: rear_message,
        filename: filename,
    })
    const serializable = makeSerializable(result)

    res.status(200).json({ message: "success", serializable })
})

export default imageRouter
