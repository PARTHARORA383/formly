// common/utils/token.ts
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { env } from '../../env.js'

function createHash(raw : string){
 return crypto.createHash('sha256').update(raw).digest('hex')
}

function generateToken() {
    const raw = crypto.randomBytes(32).toString('hex')
    const hash = createHash(raw)
    return { raw, hash }
}

function generateAccessToken(userId: string) {
    return jwt.sign({ userId }, env.jwtSecret!, { expiresIn: '15m' })
}

function generateRefreshToken(userId: string) {
    return jwt.sign({ userId }, env.jwtRefreshSecret!, { expiresIn: '30d' })
}

export { generateToken, createHash, generateAccessToken, generateRefreshToken }