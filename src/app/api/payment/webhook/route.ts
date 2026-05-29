import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyWebhookSignature, type TripayWebhookPayload } from '@/lib/tripay/webhook'
import { sendPaymentSuccessEmail } from '@/lib/email/sender'
import { transporter, MAIL_FROM } from '@/lib/email/mailer'
import { MEMBERSHIP_LIFETIME_EXPIRY } from '@/types'

export async function POST(request: Request) {
  const signature = request.headers.get('X-Callback-Signature') ?? ''
  const rawBody = await request.text()

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload: TripayWebhookPayload = JSON.parse(rawBody)
  const { reference, merchant_ref, status, paid_at } = payload

  const supabase = createAdminClient()

  // Fetch the transaction first to validate it exists and check idempotency
  const { data: existing } = await supabase
    .from('transactions')
    .select()
    .eq('tripay_reference', reference)
    .eq('merchant_ref', merchant_ref)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  }

  // Validate amount before granting membership (defense-in-depth)
  if (status === 'PAID' && payload.total_amount !== existing.amount) {
    console.error(`[webhook] Amount mismatch ref=${reference} expected=${existing.amount} got=${payload.total_amount}`)
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
  }

  // Idempotency: if already in the target status, return success without reprocessing
  if (existing.status === status) {
    return NextResponse.json({ success: true })
  }

  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .update({
      status,
      paid_at: status === 'PAID' && paid_at ? new Date(paid_at * 1000).toISOString() : null,
    })
    .eq('tripay_reference', reference)
    .eq('merchant_ref', merchant_ref)
    .eq('status', existing.status)
    .select()
    .single()

  if (txError || !tx) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  }

  if (status === 'PAID') {
    let userId = tx.user_id
    const email = tx.customer_email || ''
    const fullName = tx.customer_name || 'Member'

    // If guest checkout (no user_id), create or find account
    if (!userId && email) {
      try {
        // Generate temporary password (CSPRNG — user is directed to reset-password flow)
        const tempPassword = crypto.randomBytes(16).toString('hex')

        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        })

        if (authError) {
          // Email may already exist — look up the existing user and link them
          const { data: existingUsers } = await supabase.auth.admin.listUsers()
          const existingUser = existingUsers?.users?.find((u) => u.email === email)
          if (existingUser) {
            userId = existingUser.id
            console.log(`[webhook] Linked existing user ${userId} to guest transaction ${tx.id}`)
          } else {
            // Truly failed — log prominently so admin can manually fix
            console.error(`[webhook] CRITICAL: Cannot create or find account for ${email} ref=${reference}. Manual intervention required.`)
          }
        } else if (authUser?.user) {
          userId = authUser.user.id

          await supabase.from('profiles').insert({
            id: userId,
            email,
            full_name: fullName,
            membership_expires_at: MEMBERSHIP_LIFETIME_EXPIRY,
            role: 'member',
          })

          // Update transaction with new user_id
          await supabase
            .from('transactions')
            .update({ user_id: userId })
            .eq('id', tx.id)

          await sendGuestWelcomeEmail(email, fullName)
        }

        // Grant membership to linked existing user (account already existed)
        if (userId && authError) {
          await supabase
            .from('profiles')
            .update({ membership_expires_at: MEMBERSHIP_LIFETIME_EXPIRY })
            .eq('id', userId)

          await supabase
            .from('transactions')
            .update({ user_id: userId })
            .eq('id', tx.id)

          await sendGuestWelcomeEmail(email, fullName)
        }
      } catch (error) {
        console.error('[webhook] CRITICAL: Guest account creation threw:', error)
      }
    } else if (userId) {
      // Existing user - update membership and send confirmation
      await supabase
        .from('profiles')
        .update({ membership_expires_at: MEMBERSHIP_LIFETIME_EXPIRY })
        .eq('id', userId)

      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single()

      if (profile?.email) {
        await sendPaymentSuccessEmail(
          profile.email,
          profile.full_name ?? 'Member',
          MEMBERSHIP_LIFETIME_EXPIRY
        )
      }
    }
  }

  return NextResponse.json({ success: true })
}

async function sendGuestWelcomeEmail(email: string, name: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://profitdariai.com'}/reset-password?email=${encodeURIComponent(email)}`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#111111;border-radius:12px;overflow:hidden;border:1px solid #222222">
    <div style="background:#D4AF37;padding:32px;text-align:center">
      <h1 style="margin:0;color:#0A0A0A;font-size:24px;font-weight:700">Profit dari AI</h1>
    </div>
    <div style="padding:32px">
      <h2 style="color:#F5F5F0;font-size:20px;margin:0 0 16px">Hei ${name}! 🎉</h2>
      <p style="color:#AAAAAA;line-height:1.6;margin:0 0 24px">
        Pembayaran kamu sudah diterima! Sekarang kamu tinggal set password untuk akun kamu, lalu akses semua kursus dan ebook selamanya.
      </p>
      <div style="background:#1A1A1A;border-radius:8px;padding:20px;margin-bottom:24px;border-left:3px solid #D4AF37">
        <p style="color:#888888;font-size:13px;margin:0 0 8px">📧 Email kamu</p>
        <p style="color:#F5F5F0;font-size:14px;font-weight:600;margin:0 0 16px">${email}</p>
        <p style="color:#888888;font-size:13px;margin:0 0 4px">✅ Membership</p>
        <p style="color:#D4AF37;font-size:14px;font-weight:600;margin:0">Seumur Hidup</p>
      </div>
      <a href="${resetLink}"
        style="display:block;background:#D4AF37;color:#0A0A0A;text-align:center;padding:14px 24px;border-radius:8px;font-weight:700;text-decoration:none;font-size:16px;margin-bottom:16px">
        Set Password & Login →
      </a>
      <p style="color:#888888;font-size:13px;margin:0;text-align:center">
        Link berlaku 24 jam. Jika sudah expired, gunakan "Lupa Password" di halaman login.
      </p>
    </div>
    <div style="padding:24px 32px;border-top:1px solid #222222">
      <p style="color:#555555;font-size:12px;margin:0;text-align:center">
        Ada pertanyaan? Hubungi kami di admin@profitdariai.com
      </p>
    </div>
  </div>
</body>
</html>`

  try {
    await transporter.sendMail({
      from: MAIL_FROM,
      to: email,
      subject: '🔐 Set Password & Akses Membership Kamu — Profit dari AI',
      html,
    })
  } catch (error) {
    console.error('Failed to send guest welcome email:', error)
  }
}
