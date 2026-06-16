// import express, { type Router } from "express"
// import { eq } from "drizzle-orm"
// import { createInsertSchema } from "drizzle-zod"
// import s3Client from "../../../shared/config/s3-client.js"
// import { PutObjectCommand } from "@aws-sdk/client-s3"
// import { BUCKET_NAME } from "../../../shared/config/env-var.js"
// import { memory } from "../../../db/schema.js"
// import db from "../../../shared/config/db.js"
// import { makeSerializable } from "../../../shared/utils/make-serializable.js"
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
//
// const PRESIGNED_URL_EXPRIRES_IN = 180 // NOTE: 5 min
//
// const imageRouter: Router = express.Router()
//
// // imageRouter.get("/", async (_req, res) => {
// //     const result = await db.select().from(memory).limit(1)
// //     if (result.length === 0) {
// //         res.status(404).json({ code: "NOT_FOUND" })
// //     }
// //     const filename = result[0]!.filename
// //     const serializable = makeSerializable(result)
// //     res.status(200).json(serializable)
// // })
//
// // NOTE: this is for posting new memory
// imageRouter.get("/presigned-url/:filename", async (req, res) => {
//     const filename = String(req.params.filename ?? "")
//     if (!filename) {
//         res.status(400).json({ code: "MISSING FILENAME" })
//     }
//
//     const originalCommand = new PutObjectCommand({
//         Bucket: BUCKET_NAME,
//         Key: `originals/${filename}`,
//         ContentType: "image/jpeg",
//     })
//     const thumbnailCommand = new PutObjectCommand({
//         Bucket: BUCKET_NAME,
//         Key: `thumbnails/${filename}`,
//         ContentType: "image/jpeg",
//     })
//
//     const originalPresignedUrlPromise = getSignedUrl(s3Client, originalCommand, {
//         expiresIn: PRESIGNED_URL_EXPRIRES_IN,
//     })
//     const thumbnailPresignedUrlPromise = getSignedUrl(s3Client, thumbnailCommand, {
//         expiresIn: PRESIGNED_URL_EXPRIRES_IN,
//     })
//     const [originalPresignedUrl, thumbnailPresignedUrl] = await Promise.all([
//         originalPresignedUrlPromise,
//         thumbnailPresignedUrlPromise,
//     ])
//
//     console.log({ originalPresignedUrl, thumbnailPresignedUrl })
//
//     res.status(200).json({ originalPresignedUrl, thumbnailPresignedUrl })
// })
//
// imageRouter.post("/", async (req, res) => {
//     const schema = createInsertSchema(memory)
//     const parseResult = schema.safeParse(req.body)
//     if (parseResult.error) {
//         console.log({ error: parseResult.error })
//         res.status(400).json({ code: "INVALID REQUEST" })
//         return
//     }
//
//     const insertResult = await db.insert(memory).values(parseResult.data)
//     const serializable = makeSerializable(insertResult)
//     res.status(200).json(serializable)
// })
// // const postImageReqBodySchema = z.object({
// //     date: z.string(),
// //     front_message: z.string().nullable(), // TODO: nullish maybe?
// //     rear_message: z.string().nullable(), // TODO: nullish maybe?
// // })
// // const uploadMiddleware = upload.single("image")
// // imageRouter.post("/", uploadMiddleware, async (req, res) => {
// //     const parseResult = postImageReqBodySchema.safeParse(req.body)
// //     if (parseResult.error) {
// //         res.status(400).json({ code: "INVALID BODY" })
// //         return
// //     }
// //     const { date, front_message, rear_message } = parseResult.data
// //
// //     const original = req.file
// //     if (!original) {
// //         res.status(400).json({ message: "---- post memory payload invalid" })
// //         return
// //     }
// //     const originalBuffer = original.buffer
// //
// //     const dominantRgbPromise = findDominantColor(originalBuffer)
// //     const thumbnailBufferPromise = sharp(originalBuffer)
// //         .resize({
// //             width: 200,
// //             height: 200,
// //             fit: "cover",
// //         })
// //         .toFormat("jpeg", { quality: 80 })
// //         .toBuffer()
// //     const [dominantRgb, thumbnailBuffer] = await Promise.all([dominantRgbPromise, thumbnailBufferPromise])
// //     console.log({ dominantColor: dominantRgb, thumbnailBuffer })
// //
// //     const filename = original.originalname
// //     console.log({ filename })
// //     if (!filename) throw Error("---- filename empty")
// //
// //     const originalKey = `originals/${filename}`
// //     const thumbnailKey = `thumbnails/${filename}`
// //
// //     const originalSendPromise = s3Client.send(
// //         new PutObjectCommand({
// //             Bucket: BUCKET_NAME,
// //             Key: originalKey,
// //             Body: original.buffer,
// //             ContentType: "image/jpeg",
// //         }),
// //     )
// //     const thumbnailSendPromise = s3Client.send(
// //         new PutObjectCommand({
// //             Bucket: BUCKET_NAME,
// //             Key: thumbnailKey,
// //             Body: thumbnailBuffer,
// //             ContentType: "image/jpeg",
// //         }),
// //     )
// //     await Promise.all([originalSendPromise, thumbnailSendPromise])
// //
// //     const dominantHexcode = convertRgbToHexcode(dominantRgb)
// //
// //     const result = await db.insert(memory).values({
// //         date: date.slice(0, 10),
// //         dominant_color: dominantHexcode,
// //         front_message: front_message,
// //         rear_message: rear_message,
// //         filename: filename,
// //     })
// //     const serializable = makeSerializable(result)
// //
// //     res.status(200).json({ message: "success", serializable })
// // })
//
// // TODO: 나중에 memory router 만드는 게 좋겠다
// imageRouter.get("/:memory_id", async (req, res) => {
//     const memoryIdInString = String(req.params.memory_id)
//     const memory_id = BigInt(memoryIdInString)
//
//     const selectResult = await db.select().from(memory).where(eq(memory.id, memory_id))
//     if (selectResult.length === 0 || !selectResult[0]) {
//         res.status(404).json({ code: "MEMORY NOT FOUND BY ID" })
//         return
//     }
//     const result = selectResult[0]
//     const serializable = makeSerializable(result)
//
//     res.status(200).json(serializable)
// })
//
// export default imageRouter
