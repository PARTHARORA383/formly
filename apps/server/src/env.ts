import 'dotenv/config'

const env = {
  node: process.env.NODE_ENV,
  port: process.env.PORT,
  cors: process.env.CORS_ORIGIN,
  database: process.env.DATABASE_URL,
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM,
}

export {env}