import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createSignature, createTransaction, getFeeCalculator, calculateTotal } from '@/lib/tripay/client'
import { generateMerchantRef } from '@/lib/utils'

export async function POST(request: Request) {
  const body = await request.json()
  const { paymentMethod, productId } = body

  if (!paymentMethod || !productId) {
    return NextResponse.json(
      { error: 'paymentMethod dan productId wajib diisi' },
      { status: 400 }
    )
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Kamu harus login untuk membeli produk ini' }, { status: 401 })
  }

  // Ambil email & nama dari profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', user.id)
    .single()

  const email = profile?.email ?? user.email ?? ''
  const fullName = profile?.full_name ?? ''

  if (!email) {
    return NextResponse.json({ error: 'Email tidak ditemukan di profil kamu' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any

  // Fetch marketplace product
  const { data: product, error: productError } = await adminClient
    .from('marketplace_products')
    .select('id, title, price, ebook_id, is_published')
    .eq('id', productId)
    .eq('is_published', true)
    .single()

  if (productError || !product) {
    return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
  }

  if (!product.ebook_id) {
    return NextResponse.json({ error: 'Produk belum tersedia untuk pembelian' }, { status: 400 })
  }

  // Check if already owned
  const { data: existing } = await supabase
    .from('user_ebooks')
    .select('id')
    .eq('user_id', user.id)
    .eq('ebook_id', product.ebook_id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Kamu sudah memiliki produk ini' }, { status: 409 })
  }

  const merchantRef = generateMerchantRef(user.id)

  const baseAmount = product.price

  const feeRes = await getFeeCalculator(paymentMethod, baseAmount)
  const feeData = feeRes.success && Array.isArray(feeRes.data) ? feeRes.data[0] : null
  const totalAmount = feeData ? calculateTotal(baseAmount, feeData) : baseAmount

  const signature = createSignature(merchantRef, totalAmount)

  const result = await createTransaction({
    method: paymentMethod,
    merchant_ref: merchantRef,
    amount: totalAmount,
    customer_name: fullName,
    customer_email: email,
    order_items: [
      {
        sku: `MKT-${product.id.slice(0, 8).toUpperCase()}`,
        name: product.title,
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

  // Save transaction with ebook_ids + marketplace_product_id in metadata
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
    metadata: {
      ...result.data,
      ebook_ids: [product.ebook_id],
      marketplace_product_id: product.id,
    },
  })

  return NextResponse.json({
    checkout_url: result.data.checkout_url,
    qr_url: result.data.qr_url,
    pay_code: result.data.pay_code,
  })
}
