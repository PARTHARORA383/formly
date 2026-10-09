import type { Response } from 'express'
import { env } from '../../env.js'

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000 // 15 min
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const base = {
        httpOnly: true,
        secure: env.node === 'production',
        sameSite: env.cookieSameSite,
    } as const

    res.cookie('accessToken', accessToken, { ...base, maxAge: ACCESS_TOKEN_MAX_AGE })
    res.cookie('refreshToken', refreshToken, { ...base, maxAge: REFRESH_TOKEN_MAX_AGE })
}

function setAccessTokenCookie(res: Response, accessToken: string) {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: env.node === 'production',
        sameSite: env.cookieSameSite,
        maxAge: ACCESS_TOKEN_MAX_AGE,
    })
}

// A browser only drops a cookie when the clearing options match the ones it
// was set with, so these mirror setAuthCookies (minus maxAge).
function clearAuthCookies(res: Response) {
    const base = {
        httpOnly: true,
        secure: env.node === 'production',
        sameSite: env.cookieSameSite,
    } as const

    res.clearCookie('accessToken', base)
    res.clearCookie('refreshToken', base)
}

export { setAuthCookies, setAccessTokenCookie, clearAuthCookies }
