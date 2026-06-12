import dotenv from "dotenv"
dotenv.config()

const checkEnvVar = (envVar: string | undefined, label: string): string => {
    if (!envVar) {
        throw new Error(`---- MISSING ENV VAR: ${String(label)}`)
    }

    return envVar
}

export const DATABASE_URL = checkEnvVar(process.env.DATABASE_URL, "DATABASEURL")
