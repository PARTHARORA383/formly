import { env } from '../../env.js'
import ApiError from '../../common/utils/error.js'
import type { OAuthProfile, OAuthProvider } from './types.js'

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

type GoogleUserInfo = {
    sub: string
    email: string
    email_verified: boolean
    name?: string
    picture?: string
}

const google: OAuthProvider = {
    name: 'google',

    getAuthUrl(state: string) {
        const params = new URLSearchParams({
            client_id: env.googleClientId!,
            redirect_uri: env.googleRedirectUri!,
            response_type: 'code',
            scope: 'openid email profile',
            state,
            // Without this Google skips the refresh token on repeat logins;
            // harmless here, but keeps the consent screen predictable.
            prompt: 'select_account',
        })

        return `${AUTH_URL}?${params.toString()}`
    },

    async getProfile(code: string): Promise<OAuthProfile> {
        const tokenRes = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: env.googleClientId!,
                client_secret: env.googleClientSecret!,
                redirect_uri: env.googleRedirectUri!,
                grant_type: 'authorization_code',
                code,
            }),
        })

        if (!tokenRes.ok) {
            throw ApiError.badRequest('Failed to exchange Google authorization code')
        }

        const { access_token } = (await tokenRes.json()) as { access_token?: string }

        if (!access_token) {
            throw ApiError.badRequest('Google did not return an access token')
        }

        const userRes = await fetch(USERINFO_URL, {
            headers: { Authorization: `Bearer ${access_token}` },
        })

        if (!userRes.ok) {
            throw ApiError.badRequest('Failed to fetch Google profile')
        }

        const profile = (await userRes.json()) as GoogleUserInfo

        return {
            providerId: profile.sub,
            email: profile.email,
            emailVerified: profile.email_verified,
            name: profile.name ?? null,
            avatarUrl: profile.picture ?? null,
        }
    },
}

export default google
