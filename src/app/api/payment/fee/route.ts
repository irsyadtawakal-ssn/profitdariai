import { NextResponse } from 'next/server'
import { getFeeCalculator } from '@/lib/tripay/client'
import { MEMBERSHIP_EARLY_BIRD_PRICE } from '@/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const amountParam = searchParams.get('amount')

  if (!code) {
    return NextResponse.json({ error: 'code wajib diisi' }, { status: 400 })
  }

  // Amount dinamis (subtotal funnel); fallback ke base price.
  const parsed = amountParam ? parseInt(amountParam, 10) : NaN
  const amount = Number.isFinite(parsed) && parsed > 0 ? parsed : MEMBERSHIP_EARLY_BIRD_PRICE

  const result = await getFeeCalculator(code, amount)

  if (!result.success) {
    return NextResponse.json({ error: 'Gagal mengambil biaya admin' }, { status: 400 })
  }

  const feeData = Array.isArray(result.data) ? result.data[0] : result.data
  return NextResponse.json({ data: feeData })
}
