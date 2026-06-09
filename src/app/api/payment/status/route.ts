import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Lookup ringan status + amount transaksi by merchant_ref.
 * Dipakai halaman sukses untuk fire pixel Purchase browser-side dengan value benar.
 * Hanya mengembalikan status + amount (tanpa PII). merchant_ref tidak bisa ditebak.
 */
export async function GET(request: Request) {
  const ref = new URL(request.url).searchParams.get('ref')
  if (!ref) {
    return NextResponse.json({ error: 'ref wajib' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('transactions')
    .select('status, amount')
    .eq('merchant_ref', ref)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  return NextResponse.json(
    { status: data.status, amount: data.amount },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
