import { NextResponse } from 'next/server'
import { getFeeCalculator } from '@/lib/tripay/client'
import { MEMBERSHIP_EARLY_BIRD_PRICE } from '@/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'code wajib diisi' }, { status: 400 })
  }

  const result = await getFeeCalculator(code, MEMBERSHIP_EARLY_BIRD_PRICE)

  if (!result.success) {
    return NextResponse.json({ error: 'Gagal mengambil biaya admin' }, { status: 400 })
  }

  const feeData = Array.isArray(result.data) ? result.data[0] : result.data
  return NextResponse.json({ data: feeData })
}
