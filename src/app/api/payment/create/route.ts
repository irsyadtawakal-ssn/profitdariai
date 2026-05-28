import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createSignature, createTransaction } from '@/lib/tripay/client'
import { generateMerchantRef } from '@/lib/utils'
import { MEMBERSHIP_PRICE } from '@/types'

export async function POST(request: Request) {
  const { paymentMethod, email, fullName } = await request.json()

  if (!paymentMethod || !email || !fullName) {
    return NextResponse.json(
      { error: 'paymentMethod, email, dan fullName wajib diisi' },
      { status: 400 }
    )
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Generate merchant ref - use UUID part of user ID if logged in, otherwise use email hash
  const merchantRef = user
    ? generateMerchantRef(user.id)
    : `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const amount = MEMBERSHIP_PRICE
  const signature = createSignature(merchantRef, amount)

  const result = await createTransaction({
    method: paymentMethod,
    merchant_ref: merchantRef,
    amount,
    customer_name: fullName,
    customer_email: email,
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

  // Save transaction in DB
  await supabase.from('transactions').insert({
    user_id: user?.id ?? null,
    customer_email: email,
    customer_name: fullName,
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
