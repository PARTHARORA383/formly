import google from './google.js'
import github from './github.js'
import type { OAuthProvider } from './types.js'

// Registry — adding a provider is just implementing OAuthProvider and
// dropping it in here; the routes and controller stay unchanged.
const providers: Record<string, OAuthProvider> = {
    google,
    github,
}

function getProvider(name: string): OAuthProvider | null {
    return providers[name] ?? null
}

export { getProvider }
