// common/utils/token.ts
import crypto from 'node:crypto'
import { env } from '../../env.js'
import { signJwt, verifyJwt } from './jwt.js'

export type JwtPayload = { userId: string }

function createHash(raw : string){
 return crypto.createHash('sha256').update(raw).digest('hex')
}

function generateToken() {
    const raw = crypto.randomBytes(32).toString('hex')
    const hash = createHash(raw)
    return { raw, hash }
}

function generateAccessToken(userId: string) {
    return signJwt({ userId }, env.jwtSecret!, '15m')
}

function generateRefreshToken(userId: string) {
    return signJwt({ userId }, env.jwtRefreshSecret!, '30d')
}

function verifyAccessToken(token: string) {
    return verifyJwt<JwtPayload>(token, env.jwtSecret!)
}

function verifyRefreshToken(token: string) {
    return verifyJwt<JwtPayload>(token, env.jwtRefreshSecret!)
}

export {
    generateToken,
    createHash,
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
}