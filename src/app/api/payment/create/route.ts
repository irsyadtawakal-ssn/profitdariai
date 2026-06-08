import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createSignature, createTransaction, getFeeCalculator, calculateTotal } from '@/lib/tripay/client'
import { generateMerchantRef } from '@/lib/utils'
import { MEMBERSHIP_EARLY_BIRD_PRICE, VIP_UPSELL_PRICE } from '@/types'

export async function POST(request: Request) {
  const body = await request.json()
  const { paymentMethod, email, fullName, vip, bonus } = body
  const wantVip = vip === true
  const wantBonus = bonus === true

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

  // Fetch main product ebook — harus is_featured = true (diatur admin via checkbox "Jadikan Materi Pilihan")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any
  const { data: mainEbook } = await adminClient
    .from('ebooks')
    .select('id, title')
    .eq('is_published', true)
    .eq('is_featured', true)
    .limit(1)
    .single()

  if (!mainEbook) {
    return NextResponse.json({ error: 'Produk utama belum dikonfigurasi. Hubungi admin.' }, { status: 500 })
  }

  // Fetch bump ebook (step 2) bila admin mengonfigurasi & user memilih bonus
  let bumpEbook: { id: string; title: string; bump_price: number } | null = null
  if (wantBonus) {
    const { data: bump } = await adminClient
      .from('ebooks')
      .select('id, title, bump_price')
      .eq('is_published', true)
      .eq('is_bump_product', true)
      .not('bump_price', 'is', null)
      .limit(1)
      .single()
    if (bump && typeof bump.bump_price === 'number' && bump.bump_price > 0) {
      bumpEbook = bump
    }
  }

  // Generate merchant ref - use UUID part of user ID if logged in, otherwise use email hash
  const merchantRef = user
    ? generateMerchantRef(user.id)
    : `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Subtotal dihitung SERVER-SIDE (jangan percaya harga client)
  const mainProductName = mainEbook?.title ?? 'Profit Dari AI (E-book)'
  const mainSku = `PDA-EBOOK-${mainEbook?.id?.slice(0, 8).toUpperCase() ?? 'MAIN'}`

  type OrderItem = { sku: string; name: string; price: number; quantity: number }
  const items: OrderItem[] = [
    { sku: mainSku, name: mainProductName, price: MEMBERSHIP_EARLY_BIRD_PRICE, quantity: 1 },
  ]
  const ebookIds: string[] = mainEbook ? [mainEbook.id] : []

  if (wantVip) {
    items.push({ sku: 'PDA-VIP-CONSULT', name: 'Konsultasi VIP via WhatsApp', price: VIP_UPSELL_PRICE, quantity: 1 })
  }
  if (bumpEbook) {
    items.push({ sku: `PDA-BUMP-${bumpEbook.id.slice(0, 8).toUpperCase()}`, name: bumpEbook.title, price: bumpEbook.bump_price, quantity: 1 })
    ebookIds.push(bumpEbook.id)
  }

  const baseAmount = items.reduce((sum, it) => sum + it.price * it.quantity, 0)

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
    order_items: items,
    return_url: process.env.TRIPAY_RETURN_URL!,
    expired_time: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    signature,
  })

  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 400 })
  }

  // Save transaction in DB — store ebook_id in metadata for webhook to use
  await adminClient.from('transactions').insert({
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
      ebook_ids: ebookIds,
      vip: wantVip,
    },
  })

  return NextResponse.json({
    checkout_url: result.data.checkout_url,
    qr_url: result.data.qr_url,
    pay_code: result.data.pay_code,
  })
}
