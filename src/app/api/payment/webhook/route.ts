import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyWebhookSignature, type TripayWebhookPayload } from '@/lib/tripay/webhook'
import { sendPaymentSuccessEmail } from '@/lib/email/resend'
import { addYears } from 'date-fns'

export async function POST(request: Request) {
  const signature = request.headers.get('X-Callback-Signature') ?? ''
  const rawBody = await request.text()

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload: TripayWebhookPayload = JSON.parse(rawBody)
  const { reference, merchant_ref, status, paid_at } = payload

  const supabase = createAdminClient()

  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .update({
      status,
      paid_at: status === 'PAID' && paid_at ? new Date(paid_at * 1000).toISOString() : null,
    })
    .eq('tripay_reference', reference)
    .eq('merchant_ref', merchant_ref)
    .select()
    .single()

  if (txError || !tx) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  }

  if (status === 'PAID') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('membership_expires_at, email, full_name')
      .eq('id', tx.user_id)
      .single()

    const baseDate =
      profile?.membership_expires_at && new Date(profile.membership_expires_at) > new Date()
        ? new Date(profile.membership_expires_at)
        : new Date()

    const newExpiry = addYears(baseDate, 1)

    await supabase
      .from('profiles')
      .update({ membership_expires_at: newExpiry.toISOString() })
      .eq('id', tx.user_id)

    if (profile?.email) {
      await sendPaymentSuccessEmail({
        to: profile.email,
        name: profile.full_name ?? 'Member',
        amount: tx.amount,
        expiresAt: newExpiry,
      })
    }
  }

  return NextResponse.json({ success: true })
}
