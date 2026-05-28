import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createSignature, createTransaction } from '@/lib/tripay/client'
import { generateMerchantRef } from '@/lib/utils'
import { MEMBERSHIP_PRICE } from '@/types'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { paymentMethod } = await request.json()
  if (!paymentMethod) return NextResponse.json({ error: 'paymentMethod required' }, { status: 400 })

  const merchantRef = generateMerchantRef(user.id)
  const amount = MEMBERSHIP_PRICE
  const signature = createSignature(merchantRef, amount)

  const result = await createTransaction({
    method: paymentMethod,
    merchant_ref: merchantRef,
    amount,
    customer_name: user.user_metadata.full_name ?? user.email!,
    customer_email: user.email!,
    order_items: [
      {
        sku: 'PDA-MEMBERSHIP-LIFETIME',
        name: 'profitdariai Membership Lifetime',
        price: amount,
        quantity: 1,
      },
    ],
    return_url: process.env.TRIPAY_RETURN_URL!,
    expired_time: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    signature,
  })

  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 400 })
  }

  await supabase.from('transactions').insert({
    user_id: user.id,
    tripay_reference: result.data.reference,
    merchant_ref: merchantRef,
    amount,
    payment_method: paymentMethod,
    status: 'UNPAID',
    expires_at: new Date(result.data.expired_time * 1000).toISOString(),
    metadata: result.data,
  })

  return NextResponse.json({
    checkout_url: result.data.checkout_url,
    qr_url: result.data.qr_url,
    pay_code: result.data.pay_code,
  })
}
