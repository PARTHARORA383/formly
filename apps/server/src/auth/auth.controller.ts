import type { Request, Response, NextFunction } from 'express'
import crypto from 'node:crypto'
import AuthService from './auth.service.js'
import ApiResponse from '../common/utils/response.js'
import ApiError from '../common/utils/error.js'
import { ZodError } from 'zod'
import { env } from '../env.js'
import { setAuthCookies, setAccessTokenCookie } from '../common/utils/cookies.js'
import { getProvider } from './providers/index.js'

const OAUTH_STATE_COOKIE = 'oauthState'

// Express types route params as string | string[]; only the single-value form
// is meaningful here.
function providerNameOf(req: Request) {
    const name = req.params.provider
    return typeof name === 'string' ? name : ''
}

const AuthController = {
    magicLink: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await AuthService.magicLink(req.body)
            ApiResponse.created(res, user, 'User created successfully')
        } catch (err) {
            if (err instanceof ZodError) {
                next(ApiError.badRequest('Invalid input', err.issues))
                return
            }
            next(err instanceof ApiError ? err : ApiError.internal())
        }
    },

    verify: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user, accessToken, refreshToken } = await AuthService.verify(req.body)

            setAuthCookies(res, accessToken, refreshToken)

            ApiResponse.success(res, user, 'Verified successfully')
        } catch (err) {
            if (err instanceof ZodError) {
                next(ApiError.badRequest('Invalid input', err.issues))
                return
            }
            next(err instanceof ApiError ? err : ApiError.internal())
        }
    },
    refresh: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies.refreshToken
            if (!refreshToken) {
                throw ApiError.badRequest('No refresh token')
            }

            const { accessToken, newRefreshToken } = await AuthService.refresh(refreshToken)

            setAuthCookies(res, accessToken, newRefreshToken)

            ApiResponse.success(res, null, 'Refreshed')
        } catch (err) {
            next(err instanceof ApiError ? err : ApiError.internal())
        }
    },
    me: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await AuthService.me(req.userId!)
            ApiResponse.success(res, user, 'Fetched successfully')
        } catch (err) {
            next(err instanceof ApiError ? err : ApiError.internal())
        }
    },

    oauthRedirect: (req: Request, res: Response, next: NextFunction) => {
        try {
            const provider = getProvider(providerNameOf(req))

            if (!provider) {
                throw ApiError.notFound('Unknown provider')
            }

            // CSRF guard: the same random value goes out in the URL and into a
            // cookie, and both must match when the provider redirects back.
            const state = crypto.randomBytes(32).toString('hex')

            res.cookie(OAUTH_STATE_COOKIE, state, {
                httpOnly: true,
                secure: env.node === 'production',
                // Must be 'lax', never 'strict' — the callback arrives as a
                // cross-site redirect and 'strict' would drop this cookie.
                sameSite: 'lax',
                maxAge: 10 * 60 * 1000, // 10 min
            })

            res.redirect(provider.getAuthUrl(state))
        } catch (err) {
            next(err instanceof ApiError ? err : ApiError.internal())
        }
    },

    oauthCallback: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const provider = getProvider(providerNameOf(req))

            if (!provider) {
                throw ApiError.notFound('Unknown provider')
            }

            const { code, state } = req.query
            const expectedState = req.cookies[OAUTH_STATE_COOKIE]

            res.clearCookie(OAUTH_STATE_COOKIE)

            if (!state || !expectedState || state !== expectedState) {
                throw ApiError.badRequest('Invalid OAuth state')
            }

            if (typeof code !== 'string') {
                throw ApiError.badRequest('Missing authorization code')
            }

            const profile = await provider.getProfile(code)
            const { accessToken, refreshToken } = await AuthService.oauthLogin(profile)

            setAuthCookies(res, accessToken, refreshToken)

            res.redirect(env.frontendUrl!)
        } catch (err) {
            // This lands in the user's browser, not an API client — send them
            // back to the login page with an error instead of raw JSON.
            const message = err instanceof ApiError ? err.message : 'Something went wrong'
            res.redirect(`${env.frontendUrl}/login?error=${encodeURIComponent(message)}`)
        }
    },
}

export default AuthController
