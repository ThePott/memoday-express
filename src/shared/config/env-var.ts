import dotenv from "dotenv"
dotenv.config()

const checkEnvVar = (envVar: string | undefined, label: string): string => {
    if (!envVar) {
        throw new Error(`---- MISSING ENV VAR: ${String(label)}`)
    }

    return envVar
}

export const DATABASE_URL = checkEnvVar(process.env.DATABASE_URL, "DATABASE_URL")
export const BUCKET_NAME = checkEnvVar(process.env.BUCKET_NAME, "BUCKET_NAME")
export const BUCKET_REGION = checkEnvVar(process.env.BUCKET_REGION, "BUCKET_REGION")
export const BUCKET_ENDPOINT_URL = checkEnvVar(process.env.BUCKET_ENDPOINT_URL, "BUCKET_ENDPOINT_URL")
export const BUCKET_ACCESS_KEY_ID = checkEnvVar(process.env.BUCKET_ACCESS_KEY_ID, "BUCKET_ACCESS_KEY_ID")
export const BUCKET_SECRET_ACCESS_KEY = checkEnvVar(process.env.BUCKET_SECRET_ACCESS_KEY, "BUCKET_SECRET_ACCESS_KEY")
export const ACCESS_TOKEN_SECRET = checkEnvVar(process.env.ACCESS_TOKEN_SECRET, "ACCESS_TOKEN_SECRET")
