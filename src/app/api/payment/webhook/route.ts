import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyWebhookSignature, type TripayWebhookPayload } from '@/lib/tripay/webhook'
import { sendPaymentSuccessEmail, sendMarketplacePurchaseEmail } from '@/lib/email/sender'
import { transporter, MAIL_FROM } from '@/lib/email/mailer'

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

  // Validate amount (defense-in-depth)
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

    // Extract ebook_ids from transaction metadata
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ebookIds: string[] = (tx.metadata as any)?.ebook_ids ?? []

    // If guest checkout (no user_id), create or find account
    if (!userId && email) {
      try {
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
            console.error(`[webhook] CRITICAL: Cannot create or find account for ${email} ref=${reference}. Manual intervention required.`)
          }
        } else if (authUser?.user) {
          userId = authUser.user.id

          await supabase.from('profiles').insert({
            id: userId,
            email,
            full_name: fullName,
            role: 'member',
          })

          await supabase
            .from('transactions')
            .update({ user_id: userId })
            .eq('id', tx.id)

          await sendGuestWelcomeEmail(email, fullName)
        }

        // Grant ebooks to linked existing user
        if (userId && authError) {
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
      // Existing user — send confirmation
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single()

      if (profile?.email) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const meta = tx.metadata as any
        const isMarketplace = !!meta?.marketplace_product_id
        const orderItems: { name: string }[] = meta?.order_items ?? []
        const productTitle = orderItems[0]?.name ?? 'Profit Dari AI (E-book)'

        if (isMarketplace) {
          await sendMarketplacePurchaseEmail(profile.email, profile.full_name ?? 'Member', productTitle)
        } else {
          await sendPaymentSuccessEmail(profile.email, profile.full_name ?? 'Member', new Date().toISOString())
        }
      }
    }

    // Grant ebooks to user (insert into user_ebooks)
    if (userId && ebookIds.length > 0) {
      const rows = ebookIds.map((ebookId) => ({
        user_id: userId as string,
        ebook_id: ebookId,
        source: tx.metadata && (tx.metadata as Record<string, unknown>).marketplace_product_id
          ? 'marketplace'
          : 'checkout',
      }))

      const { error: insertError } = await supabase
        .from('user_ebooks')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert(rows as any, { onConflict: 'user_id,ebook_id', ignoreDuplicates: true })

      if (insertError) {
        console.error('[webhook] Failed to insert user_ebooks:', insertError)
      } else {
        console.log(`[webhook] Granted ${ebookIds.length} ebook(s) to user ${userId}`)
      }
    }

    // Set VIP flag bila user ambil upsell konsultasi
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isVipPurchase = (tx.metadata as any)?.vip === true
    if (userId && isVipPurchase) {
      const { error: vipError } = await supabase
        .from('profiles')
        .update({ is_vip: true })
        .eq('id', userId)
      if (vipError) {
        console.error('[webhook] Failed to set is_vip:', vipError)
      } else {
        console.log(`[webhook] Set is_vip=true for user ${userId}`)
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
        Produk kamu sudah aktif. Klik tombol di bawah untuk set password dan langsung akses konten kamu.
      </p>
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
      subject: '🎉 Produk kamu sudah aktif — Profit dari AI',
      html,
    })
  } catch (error) {
    console.error('Failed to send guest welcome email:', error)
  }
}
