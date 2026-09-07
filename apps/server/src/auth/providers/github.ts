import { env } from '../../env.js'
import ApiError from '../../common/utils/error.js'
import type { OAuthProfile, OAuthProvider } from './types.js'

const AUTH_URL = 'https://github.com/login/oauth/authorize'
const TOKEN_URL = 'https://github.com/login/oauth/access_token'
const USER_URL = 'https://api.github.com/user'
const EMAILS_URL = 'https://api.github.com/user/emails'

type GitHubUser = {
    id: number
    email: string | null
    name: string | null
    avatar_url: string | null
}

type GitHubEmail = {
    email: string
    primary: boolean
    verified: boolean
}

const github: OAuthProvider = {
    name: 'github',

    getAuthUrl(state: string) {
        const params = new URLSearchParams({
            client_id: env.githubClientId!,
            redirect_uri: env.githubRedirectUri!,
            scope: 'read:user user:email',
            state,
        })

        return `${AUTH_URL}?${params.toString()}`
    },

    async getProfile(code: string): Promise<OAuthProfile> {
        const tokenRes = await fetch(TOKEN_URL, {
            method: 'POST',
            // GitHub returns form-encoded unless JSON is explicitly requested.
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: new URLSearchParams({
                client_id: env.githubClientId!,
                client_secret: env.githubClientSecret!,
                redirect_uri: env.githubRedirectUri!,
                code,
            }),
        })

        if (!tokenRes.ok) {
            throw ApiError.badRequest('Failed to exchange GitHub authorization code')
        }

        const { access_token } = (await tokenRes.json()) as { access_token?: string }

        if (!access_token) {
            throw ApiError.badRequest('GitHub did not return an access token')
        }

        const headers = {
            Authorization: `Bearer ${access_token}`,
            Accept: 'application/vnd.github+json',
        }

        const userRes = await fetch(USER_URL, { headers })

        if (!userRes.ok) {
            throw ApiError.badRequest('Failed to fetch GitHub profile')
        }

        const profile = (await userRes.json()) as GitHubUser

        // GitHub omits the email from /user when the user keeps it private,
        // so fall back to the dedicated emails endpoint.
        let email = profile.email
        let emailVerified = false

        const emailsRes = await fetch(EMAILS_URL, { headers })

        if (emailsRes.ok) {
            const emails = (await emailsRes.json()) as GitHubEmail[]
            const primary = emails.find((e) => e.primary && e.verified) ?? emails.find((e) => e.verified)

            if (primary) {
                email = primary.email
                emailVerified = primary.verified
            }
        }

        if (!email) {
            throw ApiError.badRequest('No verified email available on this GitHub account')
        }

        return {
            providerId: String(profile.id),
            email,
            emailVerified,
            name: profile.name ?? null,
            avatarUrl: profile.avatar_url ?? null,
        }
    },
}

export default github
