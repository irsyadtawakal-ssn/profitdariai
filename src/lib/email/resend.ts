import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPaymentSuccessEmail({
  to,
  name,
  amount,
  expiresAt,
}: {
  to: string
  name: string
  amount: number
  expiresAt: Date
}) {
  return resend.emails.send({
    from: 'profitdariai <noreply@profitdariai.com>',
    to,
    subject: 'Akses kamu sudah aktif — selamat datang di profitdariai!',
    html: `
      <div style="font-family: Inter, sans-serif; background: #0A0A0A; color: #F5F5F0; padding: 40px; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D4AF37; margin-bottom: 8px;">Selamat datang di profitdariai!</h1>
        <p>Halo ${name},</p>
        <p>Pembayaran kamu sebesar <strong>Rp ${amount.toLocaleString('id-ID')}</strong> berhasil diproses.</p>
        <p>Akses membership kamu aktif sampai <strong>${expiresAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display: inline-block; background: #D4AF37; color: #0A0A0A; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px;">
          Mulai Belajar
        </a>
        <p style="margin-top: 32px; font-size: 14px; color: #888;">Jika ada pertanyaan, balas email ini atau hubungi support@profitdariai.com</p>
      </div>
    `,
  })
}

export async function sendRenewalReminderEmail({
  to,
  name,
  expiresAt,
  daysLeft,
}: {
  to: string
  name: string
  expiresAt: Date
  daysLeft: number
}) {
  return resend.emails.send({
    from: 'profitdariai <noreply@profitdariai.com>',
    to,
    subject: `Membership kamu berakhir dalam ${daysLeft} hari`,
    html: `
      <div style="font-family: Inter, sans-serif; background: #0A0A0A; color: #F5F5F0; padding: 40px; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D4AF37;">Waktunya perpanjang membership</h1>
        <p>Halo ${name},</p>
        <p>Membership kamu akan berakhir pada <strong>${expiresAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> (${daysLeft} hari lagi).</p>
        <p>Perpanjang sekarang untuk tetap akses semua kursus dan ebook.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing"
           style="display: inline-block; background: #D4AF37; color: #0A0A0A; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px;">
          Perpanjang Sekarang
        </a>
      </div>
    `,
  })
}
