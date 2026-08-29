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

const EmailService = {
  sendWelcomeEmail,
}

export default EmailService
