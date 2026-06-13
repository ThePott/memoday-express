import { PutObjectCommand } from "@aws-sdk/client-s3"
import express, { Router } from "express"
import sharp from "sharp"
import s3Client from "../../../shared/config/s3-client.js"
import { readFileSync } from "node:fs"
import { BUCKET_NAME } from "../../../shared/config/env-var.js"

const router: Router = express.Router()

router.get("/", async (_req, res) => {
    console.log("---- debug called, hello world")
    res.status(200).send("---- hello world")
})

router.post("/bucket", async (_req, res) => {
    const originalBuffer = readFileSync("src/features/debug/router/smaple.jpeg")
    const thumbnailBuffer = await sharp(originalBuffer)
        .resize({
            width: 200, // Target width in pixels
            height: 200, // Target height in pixels
            fit: "cover", // Crops the image to match the aspect ratio exactly
            position: "center", // Focuses the crop on the center of the image
        })
        .toFormat("jpeg", { quality: 80 }) // Compresses and optimizes file size
        .toBuffer()

    const filename = `sample__${Date.now()}`

    const originalPromise = s3Client.send(
        new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `originals/${filename}`, // stored under "original/"
            Body: originalBuffer,
            ContentType: "image/jpeg",
        }),
    )
    const thumbnailPromise = s3Client.send(
        new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `thumbnails/${filename}`, // stored under "thumbnails/"
            Body: thumbnailBuffer,
            ContentType: "image/jpeg",
        }),
    )
    const [originalResponse, thumbnailResponse] = await Promise.all([originalPromise, thumbnailPromise])

    console.log({ originalResponse, thumbnailResponse })

    res.status(200).send("---- bucket testing")
})

router.get("/color", async (_req, res) => {
    const originalBuffer = readFileSync("src/features/debug/router/smaple.jpeg")
    const onePixelBuffer = await sharp(originalBuffer).resize(1, 1, { fit: "cover" }).raw().toBuffer()
    const rgb = [onePixelBuffer[0], onePixelBuffer[1], onePixelBuffer[2]]

    console.log({ rgb })
    // dominantColor is [R, G, B] as Uint8
    res.status(200).json({ rgb })
})

export default router
