import express, { type Router } from "express"
import { eq } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import s3Client from "../../shared/config/s3-client.js"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { BUCKET_NAME } from "../../shared/config/env-var.js"
import { memory } from "../../db/schema.js"
import db from "../../shared/config/db.js"
import { makeSerializable } from "../../shared/utils/make-serializable.js"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const PRESIGNED_URL_EXPRIRES_IN = 180 // NOTE: 5 min

const memoryRouter: Router = express.Router()

// stage 1: presigned url
memoryRouter.get("/presigned-url/:filename", async (req, res) => {
    const filename = String(req.params.filename ?? "")
    if (!filename) {
        res.status(400).json({ code: "MISSING FILENAME" })
    }

    const originalCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `originals/${filename}`,
        ContentType: "image/jpeg",
    })
    const thumbnailCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `thumbnails/${filename}`,
        ContentType: "image/jpeg",
    })

    const originalPresignedUrlPromise = getSignedUrl(s3Client, originalCommand, {
        expiresIn: PRESIGNED_URL_EXPRIRES_IN,
    })
    const thumbnailPresignedUrlPromise = getSignedUrl(s3Client, thumbnailCommand, {
        expiresIn: PRESIGNED_URL_EXPRIRES_IN,
    })
    const [originalPresignedUrl, thumbnailPresignedUrl] = await Promise.all([
        originalPresignedUrlPromise,
        thumbnailPresignedUrlPromise,
    ])

    console.log({ originalPresignedUrl, thumbnailPresignedUrl })

    res.status(200).json({ originalPresignedUrl, thumbnailPresignedUrl })
})

// stage 2: user directly put image to bucket
// stage 3: user post memory info
memoryRouter.post("/", async (req, res) => {
    const schema = createInsertSchema(memory)
    const parseResult = schema.safeParse(req.body)
    if (parseResult.error) {
        console.log({ error: parseResult.error })
        console.log("---- safe parsing failed")
        console.log({ body: req.body })
        res.status(400).json({ code: "INVALID MEMORY POST PAYLOAD", error: parseResult.error })
        return
    }

    const insertResult = await db.insert(memory).values(parseResult.data)
    const serializable = makeSerializable(insertResult)
    res.status(200).json(serializable)
})

memoryRouter.get("/:memory_id", async (req, res) => {
    const memoryIdInString = String(req.params.memory_id)
    const memory_id = BigInt(memoryIdInString)

    const selectResult = await db.select().from(memory).where(eq(memory.id, memory_id))
    if (selectResult.length === 0 || !selectResult[0]) {
        res.status(404).json({ code: "MEMORY NOT FOUND BY ID" })
        return
    }
    const result = selectResult[0]
    const serializable = makeSerializable(result)

    res.status(200).json(serializable)
})

export default memoryRouter
