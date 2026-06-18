import express, { type Router } from "express"
import { eq, gte, lt } from "drizzle-orm"
import { createInsertSchema } from "drizzle-orm/zod"
import s3Client from "../../shared/config/s3-client.js"
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { BUCKET_NAME } from "../../shared/config/env-var.js"
import { memory } from "../../db/schema.js"
import db from "../../shared/config/db.js"
import { makeSerializable } from "../../shared/utils/make-serializable.js"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import z from "zod"

const PRESIGNED_URL_EXPRIRES_IN = 180 // NOTE: 5 min

const memoryRouter: Router = express.Router()

const MethodSchema = z.enum(["get", "put"])
const makeCommand = (method: z.infer<typeof MethodSchema>, prefix: "originals" | "thumbnails", filename: string) => {
    switch (method) {
        case "get":
            return new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: `${prefix}/${filename}`,
            })
        case "put":
            return new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: `${prefix}/${filename}`,
                ContentType: "image/jpeg",
            })
    }
}
// stage 1: presigned url
memoryRouter.get("/presigned-url/:method/:filename", async (req, res) => {
    console.log("---- presigned called")
    const schema = z.object({
        filename: z.string().min(1),
        method: z.enum(["get", "put"]),
    })
    const parseResult = schema.safeParse({
        filename: String(req.params.filename ?? ""),
        method: String(req.params.method ?? ""),
    })
    if (parseResult.error) {
        console.log({ error: parseResult.error })
        res.status(400).json({ code: "INVALID FILENAME OR METHOD", error: parseResult.error })
        return
    }
    const { filename, method } = parseResult.data

    const MUST_REPLACE_WITH_GLOBAL_ONE = (
        method: z.infer<typeof schema>["method"],
        prefix: "originals" | "thumbnails",
    ) => {
        switch (method) {
            case "get":
                return new GetObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: `${prefix}/${filename}`,
                })
            case "put":
                return new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: `${prefix}/${filename}`,
                    ContentType: "image/jpeg",
                })
        }
    }

    const originalCommand = MUST_REPLACE_WITH_GLOBAL_ONE(method, "originals")
    const thumbnailCommand = MUST_REPLACE_WITH_GLOBAL_ONE(method, "thumbnails")
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

memoryRouter.get("/day/:ymd", async (req, res) => {
    const ymd = String(req.params.ymd)

    const selectResult = await db.select().from(memory).where(eq(memory.date, ymd))
    if (selectResult.length === 0 || !selectResult[0]) {
        console.log({ error: "MEMORY NOT FOUND BY DATE" })
        res.status(404).json({ code: "MEMORY NOT FOUND BY DATE" })
        return
    }
    const result = selectResult[0]
    const serializable = makeSerializable(result)

    res.status(200).json(serializable)
})

const findMonthStartEnd = (ym: string): [string, string] => {
    const start = `${ym}-01`
    const [year, month] = ym.split("-").map(Number)
    if (!year || !month) {
        console.log({ error: "---- FAILED FINDING MONTH START END" })
        throw new Error("---- FAILED FINDING MONTH START END")
    }
    const end = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`
    return [start, end]
}
memoryRouter.get("/month/:ym", async (req, res) => {
    const ymSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "must be yyyy-mm")
    const parseResult = ymSchema.safeParse(req.params.ym)
    if (parseResult.error) {
        console.log({ error: parseResult.error })
        res.status(400).json({ code: "INVALID_YM", error: parseResult.error })
        return
    }
    const ym = parseResult.data
    const [start, end] = findMonthStartEnd(ym)

    const selectResult = await db
        .select()
        .from(memory)
        .where(gte(memory.date, start) && lt(memory.date, end))
    if (selectResult.length === 0) {
        console.log({ error: "MEMORY NOT FOUND BY YYYY-MM" })
        res.status(404).json({ code: "MEMORY NOT FOUND BY YYYY-MM" })
        return
    }

    const commandArray = selectResult.map((result) => makeCommand("get", "thumbnails", result.filename))
    const presignedUrlPromiseArray = commandArray.map((command) =>
        getSignedUrl(s3Client, command, {
            expiresIn: PRESIGNED_URL_EXPRIRES_IN,
        }),
    )
    const presignedUrlArray = await Promise.all(presignedUrlPromiseArray)
    const presignedUrlAttached = selectResult.map((result, index) => ({
        ...result,
        thumbnailPresignedUrl: presignedUrlArray[index],
    }))
    const serializable = makeSerializable(presignedUrlAttached)
    res.status(200).json(serializable)
})

export default memoryRouter
