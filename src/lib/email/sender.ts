import { transporter, MAIL_FROM } from './mailer'
import { purchaseConfirmationEmail } from './templates'

export async function sendPaymentSuccessEmail(
  to: string,
  name: string,
  _expiresAt: string, // kept for backward compatibility, unused
  productTitle = 'Profit Dari AI (E-book)'
) {
  const { subject, html } = purchaseConfirmationEmail(name, productTitle)
  await transporter.sendMail({ from: MAIL_FROM, to, subject, html })
}

/** @deprecated — no renewal system. Kept to avoid breaking old imports. */
export async function sendRenewalReminderEmail(_to: string, _name: string, _expiresAt: string) {
  // no-op: renewal system removed
}
