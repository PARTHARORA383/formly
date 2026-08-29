import { Resend } from 'resend'
import { env } from '../../env.js'

const resend = new Resend(env.resendApiKey)

async function sendWelcomeEmail(to: string, name?: string) {
  const { error } = await resend.emails.send({
    from: env.emailFrom!,
    to: [to],
    subject: 'Welcome to Formly',
    html: `<p>Hi ${name ?? 'there'}, welcome to Formly!</p>`,
  })

  if (error) {
    console.error('Failed to send welcome email:', error)
  }
}

// common/services/email.service.ts
async function sendMagicLinkEmail(to: string, token: string) {
  const url = `${env.frontendUrl}/auth/verify?token=${token}`

  const { error } = await resend.emails.send({
    from: env.emailFrom!,
    to: [to],
    subject: 'Your Formly login link',
    html: `<p>Click to sign in: <a href="${url}">${url}</a></p><p>This link expires in 15 minutes.</p>`,
  })

  if (error) {
    console.error('Failed to send magic link email:', error)
  }
}

const EmailService = {
  sendWelcomeEmail,
  sendMagicLinkEmail
}

export default EmailService
