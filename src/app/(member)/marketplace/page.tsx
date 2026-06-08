import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MarketplaceClient } from '@/components/member/MarketplaceClient'

export default async function MarketplacePage() {
  const supabase = await createServerClient()
  const adminClient = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch marketplace products + user's owned ebooks in parallel
  const [productsRes, ownedRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (adminClient as any)
      .from('marketplace_products')
      .select('id, slug, title, description, category, price, original_price, cover_url, product_url, ebook_id')
      .eq('is_published', true)
      .order('sort_order'),
    user
      ? supabase.from('user_ebooks').select('ebook_id').eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
  ])

  const products = productsRes.data ?? []
  const ownedEbookIds = new Set((ownedRes.data ?? []).map((r: { ebook_id: string }) => r.ebook_id))

  // Annotate each product with isOwned flag
  const annotatedProducts = products.map((p: {
    id: string
    slug: string
    title: string
    description: string | null
    category: string
    price: number
    original_price: number | null
    cover_url: string | null
    product_url: string
    ebook_id: string | null
  }) => ({
    ...p,
    isOwned: p.ebook_id ? ownedEbookIds.has(p.ebook_id) : false,
  }))

  return <MarketplaceClient products={annotatedProducts} />
}
