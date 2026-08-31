import { eq, and, isNull, gt } from 'drizzle-orm'
import { db } from '../db/index.js'
import { magicLinksTable, usersTable } from '../db/schema.js'
import { type MagicLink, type Verify } from './auth.types.js'
import ApiError from '../common/utils/error.js'
import { createHash, generateAccessToken, generateRefreshToken, generateToken } from '../common/utils/token.js'
import EmailService from '../common/services/email.service.js'


async function magicLink(input: MagicLink) {

    const isExistingUser = await db.select().from(usersTable).where(eq(usersTable.email, input.email))

    let user = isExistingUser[0];

    if (!user) {
        const [newUser] = await db.insert(usersTable).values({ email: input.email }).returning()

        if (!newUser) {
            throw ApiError.badRequest()
        }
        user = newUser
    }

    const { raw, hash } = generateToken()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 min

    await db.insert(magicLinksTable).values({
        userId: user.id,
        tokenHash: hash,
        expiresAt,
    })

    await EmailService.sendMagicLinkEmail(user.email, raw)

    return { email: user.email }
}

async function verify(input: Verify) {

    const token = createHash(input.token)

    const [link] = await db
        .select()
        .from(magicLinksTable)
        .where(
            and(
                eq(magicLinksTable.tokenHash, token),
                isNull(magicLinksTable.usedAt),
                gt(magicLinksTable.expiresAt, new Date())
            )
        )

    if (!link) {
        throw ApiError.badRequest('This link is invalid or has expired')
    }

    await db
        .update(magicLinksTable)
        .set({ usedAt: new Date() })
        .where(eq(magicLinksTable.id, link.id))

    const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, link.userId))

    if (!user) {
        throw ApiError.internal()
    }

    if (!user.emailVerifiedAt) {
        await db
            .update(usersTable)
            .set({ emailVerifiedAt: new Date() })
            .where(eq(usersTable.id, user.id))
    }

    const accessToken = generateAccessToken(user.id.toString())
    const refreshToken = generateRefreshToken(user.id.toString())

    const refreshTokenHash = createHash(refreshToken)

    await db.update(usersTable).set({ refreshTokenHash}).where(eq(usersTable.id , user.id))

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
        },
        accessToken,
        refreshToken,
    }

}



const AuthService = {
    magicLink,
    verify
}

export default AuthService
