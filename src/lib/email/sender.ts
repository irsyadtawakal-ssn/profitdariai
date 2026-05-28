import { transporter, MAIL_FROM } from './mailer'
import { paymentSuccessEmail, renewalReminderEmail } from './templates'

export async function sendPaymentSuccessEmail(to: string, name: string, expiresAt: string) {
  const { subject, html } = paymentSuccessEmail(name, expiresAt)
  await transporter.sendMail({ from: MAIL_FROM, to, subject, html })
}

export async function sendRenewalReminderEmail(to: string, name: string, expiresAt: string) {
  const { subject, html } = renewalReminderEmail(name, expiresAt)
  await transporter.sendMail({ from: MAIL_FROM, to, subject, html })
}
