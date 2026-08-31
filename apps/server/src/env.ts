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
}

export { env }