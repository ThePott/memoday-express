import type { IncomingHttpHeaders } from "http"
import jwt from "jsonwebtoken"
import { ACCESS_TOKEN_SECRET } from "../config/env-var.js"

export type Token = {
    appUserIdInString: string
}

type DecodedToken = Token & {
    exp: number
    iat: number
}

const extractAccessTokenInHeaders = (headers: IncomingHttpHeaders): string => {
    const authorization = headers.authorization
    if (!authorization) throw new Error("MISSING_TOKEN_IN_HEADERS")

    const access_token = authorization.split(" ")[1]
    if (!access_token) throw new Error("MISSING_TOKEN_IN_HEADERS")

    return access_token
}

const decodeAccessTokenInHeaders = (headers: IncomingHttpHeaders): DecodedToken => {
    const accessToken = extractAccessTokenInHeaders(headers)
    try {
        const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET)
        return decoded as DecodedToken
    } catch {
        throw new Error("TOKEN_EXPIRED_OR_CONTAMINATED")
    }
}

export const extractAppUserId = (headers: IncomingHttpHeaders) => {
    const { appUserIdInString }: Token = decodeAccessTokenInHeaders(headers)
    const app_user_id = BigInt(appUserIdInString)
    return { app_user_id }
}
