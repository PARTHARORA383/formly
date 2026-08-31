import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/token.js'
import ApiError from '../utils/error.js'

declare global {
    namespace Express {
        interface Request {
            userId?: string
        }
    }
}

function authenticate(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies.accessToken

    if (!accessToken) {
        next(ApiError.unauthorized('Not authenticated'))
        return
    }

    try {
        const payload = verifyAccessToken(accessToken)
        req.userId = payload.userId
        next()
    } catch {
        next(ApiError.unauthorized('Invalid or expired session'))
    }
}

export default authenticate
