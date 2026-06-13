import { S3Client } from "@aws-sdk/client-s3"
import { BUCKET_ACCESS_KEY_ID, BUCKET_ENDPOINT_URL, BUCKET_REGION, BUCKET_SECRET_ACCESS_KEY } from "./env-var.js"

const s3Client = new S3Client({
    region: BUCKET_REGION,
    endpoint: BUCKET_ENDPOINT_URL,
    credentials: {
        accessKeyId: BUCKET_ACCESS_KEY_ID,
        secretAccessKey: BUCKET_SECRET_ACCESS_KEY,
    },
})

export default s3Client
