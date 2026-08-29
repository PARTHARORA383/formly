import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { magicLinksTable, usersTable } from '../db/schema.js'
import { type MagicLink } from './auth.types.js'
import ApiError from '../common/utils/error.js'
import { generateToken } from '../common/utils/token.js'
import EmailService from '../common/services/email.service.js'
import { email } from 'zod'


async function magicLink(input: MagicLink) {

    const isExistingUser = await db.select().from(usersTable).where(eq(usersTable.email, input.email))

    let user = isExistingUser[0];

    //signup a user
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

const AuthService = {
    magicLink
}

export default AuthService
