// common/utils/token.ts
import crypto from 'node:crypto'

function createHash(raw : string){
 return crypto.createHash('sha256').update(raw).digest('hex')
}

function generateToken() {
    const raw = crypto.randomBytes(32).toString('hex')
    const hash = createHash(raw)
    return { raw, hash }
}

export { generateToken  , createHash}