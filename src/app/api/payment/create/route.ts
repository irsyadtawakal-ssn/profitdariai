import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createSignature, createTransaction, getFeeCalculator, calculateTotal } from '@/lib/tripay/client'
import { generateMerchantRef } from '@/lib/utils'
import { MEMBERSHIP_EARLY_BIRD_PRICE } from '@/types'

export async function POST(request: Request) {
  const body = await request.json()
  const { paymentMethod, email, fullName } = body

  if (!paymentMethod || !email || !fullName) {
    return NextResponse.json(
      { error: 'paymentMethod, email, dan fullName wajib diisi' },
      { status: 400 }
    )
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
  }

  // Validate fullName length
  if (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.length > 100) {
    return NextResponse.json({ error: 'Nama tidak valid' }, { status: 400 })
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Generate merchant ref - use UUID part of user ID if logged in, otherwise use email hash
  const merchantRef = user
    ? generateMerchantRef(user.id)
    : `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const baseAmount = MEMBERSHIP_EARLY_BIRD_PRICE

  // Hitung total dengan biaya admin dari Tripay
  const feeRes = await getFeeCalculator(paymentMethod, baseAmount)
  const feeData = feeRes.success && Array.isArray(feeRes.data) ? feeRes.data[0] : null
  const totalAmount = feeData
    ? calculateTotal(baseAmount, feeData)
    : baseAmount

  const signature = createSignature(merchantRef, totalAmount)

  const result = await createTransaction({
    method: paymentMethod,
    merchant_ref: merchantRef,
    amount: totalAmount,
    customer_name: fullName,
    customer_email: email,
    order_items: [
      {
        sku: 'PDA-MEMBERSHIP-LIFETIME',
        name: 'profitdariai Membership',
        price: baseAmount,
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
    amount: totalAmount,
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
