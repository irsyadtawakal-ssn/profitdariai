import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPaymentChannels } from '@/lib/tripay/client'
import { CheckoutForm } from '@/components/member/CheckoutForm'
import { MEMBERSHIP_EARLY_BIRD_PRICE } from '@/types'

export type BumpProduct = {
  id: string
  title: string
  bumpPrice: number
  originalPrice: number | null
}

export default async function CheckoutPage() {
  const [supabase, channelsRes] = await Promise.all([
    createServerClient(),
    getPaymentChannels().catch(() => ({ success: false, data: [] })),
  ])

  await supabase.auth.getUser()

  const channelIcons: Record<string, string> = {}
  if (channelsRes.success) {
    for (const ch of channelsRes.data) {
      if (ch.icon_url) channelIcons[ch.code] = ch.icon_url
    }
  }

  // Fetch SEMUA bump products (step 2) yang dikonfigurasi admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any
  const { data: bumps } = await adminClient
    .from('ebooks')
    .select('id, title, bump_price')
    .eq('is_published', true)
    .eq('is_bump_product', true)
    .not('bump_price', 'is', null)
    .order('sort_order', { ascending: true })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validBumps: any[] = Array.isArray(bumps)
    ? bumps.filter((b) => typeof b.bump_price === 'number' && b.bump_price > 0)
    : []

  let bumpProducts: BumpProduct[] = []
  if (validBumps.length > 0) {
    // Normal price (untuk dicoret) diambil dari marketplace_products bila ada
    const { data: mps } = await adminClient
      .from('marketplace_products')
      .select('ebook_id, price, original_price')
      .in('ebook_id', validBumps.map((b) => b.id))

    const priceByEbook = new Map<string, number | null>()
    if (Array.isArray(mps)) {
      for (const mp of mps) {
        priceByEbook.set(mp.ebook_id, (mp.original_price as number | null) ?? (mp.price as number | null) ?? null)
      }
    }

    bumpProducts = validBumps.map((b) => ({
      id: b.id,
      title: b.title,
      bumpPrice: b.bump_price,
      originalPrice: priceByEbook.get(b.id) ?? null,
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#F5F5F0] mb-2">Bergabung Sekarang</h1>
          <p className="text-[#888888] text-sm">
            Akses Profit Dari AI — Rp {MEMBERSHIP_EARLY_BIRD_PRICE.toLocaleString('id-ID')} (Sekali Bayar)
          </p>
        </div>
        <CheckoutForm channelIcons={channelIcons} bumpProducts={bumpProducts} />
      </div>
    </div>
  )
}
