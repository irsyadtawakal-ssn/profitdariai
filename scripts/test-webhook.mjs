/**
 * Simulasi webhook Tripay PAID untuk test customer journey lokal.
 *
 * Usage:
 *   node scripts/test-webhook.mjs [email] [nama]
 *
 * Contoh:
 *   node scripts/test-webhook.mjs test@gmail.com "Budi Santoso"
 *
 * Yang dilakukan script ini:
 *   1. Insert transaksi UNPAID ke Supabase (guest checkout)
 *   2. Kirim webhook PAID ke localhost:3000 dengan signature valid
 *   3. Print hasil — cek email masuk setelah ini
 */

import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Parse .env.local manually (no dotenv dependency needed)
const envPath = resolve(__dirname, '../.env.local')
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] ??= match[2].trim()
}

const {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  TRIPAY_PRIVATE_KEY,
  TRIPAY_MERCHANT_CODE,
} = process.env

if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TRIPAY_PRIVATE_KEY) {
  console.error('❌  .env.local tidak lengkap. Pastikan SUPABASE & TRIPAY vars ada.')
  process.exit(1)
}

const email    = process.argv[2] || 'test-webhook@example.com'
const fullName = process.argv[3] || 'Test User'
const amount   = 199_000

// Buat reference & merchant_ref unik
const reference   = `TEST-${Date.now()}`
const merchantRef = `guest-test-${Date.now()}`

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// ── 1. Insert transaksi UNPAID ──────────────────────────────────────────────
console.log(`\n📝 Insert transaksi UNPAID...`)
console.log(`   email      : ${email}`)
console.log(`   nama       : ${fullName}`)
console.log(`   reference  : ${reference}`)
console.log(`   merchantRef: ${merchantRef}`)

const { error: insertError } = await supabase.from('transactions').insert({
  user_id:         null,
  customer_email:  email,
  customer_name:   fullName,
  tripay_reference: reference,
  merchant_ref:    merchantRef,
  amount,
  payment_method:  'QRIS',
  status:          'UNPAID',
  expires_at:      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  metadata:        {},
})

if (insertError) {
  console.error('❌  Gagal insert transaksi:', insertError.message)
  process.exit(1)
}
console.log('✅  Transaksi berhasil diinsert.')

// ── 2. Build webhook payload ────────────────────────────────────────────────
const payload = {
  reference,
  merchant_ref:        merchantRef,
  payment_method:      'QRIS',
  payment_method_code: 'QRIS',
  total_amount:        amount,
  fee_merchant:        1393,
  fee_customer:        0,
  total_fee:           1393,
  amount_received:     197607,
  is_closed_payment:   1,
  status:              'PAID',
  paid_at:             Math.floor(Date.now() / 1000),
  note:                '',
}

const rawBody  = JSON.stringify(payload)
const signature = crypto
  .createHmac('sha256', TRIPAY_PRIVATE_KEY.trim())
  .update(rawBody)
  .digest('hex')

// ── 3. POST ke webhook ──────────────────────────────────────────────────────
const webhookUrl = 'http://localhost:3000/api/payment/webhook'
console.log(`\n🚀 Kirim webhook PAID ke ${webhookUrl}...`)

const res = await fetch(webhookUrl, {
  method:  'POST',
  headers: {
    'Content-Type':          'application/json',
    'X-Callback-Signature':  signature,
  },
  body: rawBody,
})

const responseText = await res.text()
console.log(`\n📬 Response: ${res.status} ${res.statusText}`)
console.log(`   Body     : ${responseText}`)

if (res.ok) {
  console.log('\n✅  Webhook berhasil diproses!')
  console.log('   → Cek inbox email:', email)
  console.log('   → Cek Supabase tabel transactions & profiles')
} else {
  console.error('\n❌  Webhook gagal. Cek output dev server untuk detail error.')
}
