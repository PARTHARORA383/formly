// Shape every OAuth provider normalises its profile into, so the rest of the
// auth flow never needs to know which provider a user came from.
type OAuthProfile = {
    providerId: string
    email: string
    emailVerified: boolean
    name: string | null
    avatarUrl: string | null
}

type OAuthProvider = {
    name: string
    // Where to send the browser to start the consent flow.
    getAuthUrl(state: string): string
    // Swap the ?code= from the callback for the user's profile.
    getProfile(code: string): Promise<OAuthProfile>
}

export type { OAuthProfile, OAuthProvider }
