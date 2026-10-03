import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/token.js'

// Like authenticate, but for routes that are open to everyone. If a valid
// session cookie came with the request, req.userId is set so the route can
// treat the owner differently. A missing, expired or invalid cookie is not an
// error here: the caller is simply treated as anonymous.
function authenticateOptional(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies.accessToken

    if (accessToken) {
        try {
            req.userId = verifyAccessToken(accessToken).userId
        } catch {
            // Expired or tampered: carry on as anonymous.
        }
    }

    next()
}

export default authenticateOptional
