import express, { type Router } from "express"
import { eq } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import z from "zod"
import jwt, { type Jwt, type JwtPayload } from "jsonwebtoken"
import axios from "axios"
import crypto from "node:crypto"
import { ACCESS_TOKEN_SECRET } from "../../shared/config/env-var.js"
import db from "../../shared/config/db.js"
import { app_user, memory } from "../../db/schema.js"
import type { Token } from "../../shared/utils/decode-jwt-in-headers.js"

const loginRouter: Router = express.Router()

const jwkSchema = z.object({
    kty: z.literal("RSA"),
    kid: z.string(),
    use: z.literal("sig"),
    alg: z.literal("RS256"),
    n: z.string(),
    e: z.string(),
})
type JWK = z.infer<typeof jwkSchema>

const APPLE_PUBLIC_KEY_URL = "https://appleid.apple.com/auth/keys" as const
// const ACCESS_TOKEN_AGE: number = 1000 * 60 * 60 * 24 * 30 // NOTE: 30일 <<<< for deployment
const ACCESS_TOKEN_AGE: number = 1000 * 60 * 60 // NOTE: 1h <<<< for deployment

const publicKeyArraySchema = z.object({
    keys: z.array(jwkSchema),
})
const getMatchingKey = async (decodedJwt: Jwt): Promise<JWK | null> => {
    const response = await axios.get(APPLE_PUBLIC_KEY_URL)
    const parseResult = publicKeyArraySchema.safeParse(response.data)
    if (parseResult.error) {
        console.log({ error: parseResult.error })
        return null
    }

    const { keys } = parseResult.data

    const matchingKey = keys.find((key) => key.kid === decodedJwt.header.kid)
    if (!matchingKey) {
        console.log("---- no matching key")
        return null
    }

    return matchingKey
}

const selectedAppUserIdInString = async (identity: string): string => {
    const newUser: z.infer<typeof appUserInsertSchema> = {
        provider: "apple",
        identity: identity,
    }

    const selectResult = await db
        .select()
        .from(app_user)
        .where(eq(app_user.provider, newUser.provider) && eq(app_user.identity, newUser.identity))

    if (selectResult[0]) return String(selectResult[0].id)

    const insertResult = await db.insert(app_user).values(newUser)
    console.log({ insertResult })

    throw new Error("---- not handled insert result")
}
// TODO: need to throw for errors, then middleware catches it and handle it?
// Not sure central error management is good
// it sucks up all error, so error location become vague
const appUserInsertSchema = createInsertSchema(app_user)
loginRouter.post("/apple/validate", async (req, res) => {
    const schema = z.object({ appleIdentityTokenString: z.string() })
    const parseResult = schema.safeParse(req.body)
    if (parseResult.error) {
        console.log({ error: parseResult.error })
        res.status(400).json({ code: "APPLE_IDENTITY_TOKEN_MISSING", error: parseResult.error })
        return
    }
    const { appleIdentityTokenString } = parseResult.data

    const decodedJwt = jwt.decode(appleIdentityTokenString, { complete: true })
    if (!decodedJwt) {
        console.log("---- decoding apple jwt failed")
        res.status(401).json({ code: "FAILED_TO_DECODE_APPLE_JWT" })
        return
    }

    const matchingKey = await getMatchingKey(decodedJwt)
    if (!matchingKey) {
        res.status(401).json({ code: "NO_MATCHING_KEY" })
        return
    }

    const payload = decodedJwt.payload as JwtPayload
    if (payload.iss !== "https://appleid.apple.com" || payload.aud !== "com.haheungju.memoday") {
        res.status(401).json({ code: "INVALID_ISS_OR_AUD" })

        return
    }

    const publicKey = crypto.createPublicKey({ format: "jwk", key: matchingKey })
    try {
        jwt.verify(appleIdentityTokenString, publicKey, { algorithms: ["RS256"] })
    } catch {
        res.status(401).json({ code: "INVALID_ISS_OR_AUD" })
        return
    }

    const identity = decodedJwt.payload.sub
    if (typeof identity !== "string" || !identity) {
        res.status(401).json({ code: "INVALID_IDENTITY_FROM_JWT" })
        return
    }
    const token: Token = { appUserIdInString: selectedAppUserIdInString(identity) }
    const accessToken = jwt.sign(token, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_AGE })

    res.status(200).json({ accessToken })
})

export default loginRouter
