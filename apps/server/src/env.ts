import 'dotenv/config'

const env = {
    node: process.env.NODE_ENV,
    port: process.env.PORT,
    cors: process.env.CORS_ORIGIN,
    database: process.env.DATABASE_URL,
    resendApiKey: process.env.RESEND_API_KEY,
    emailFrom: process.env.EMAIL_FROM,
    frontendUrl : process.env.FRONTEND_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    cookieSameSite: process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none' | undefined,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    githubRedirectUri: process.env.GITHUB_REDIRECT_URI,
}

export { env }