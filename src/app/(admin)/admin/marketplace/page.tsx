import { createAdminClient } from '@/lib/supabase/admin'
import { MarketplaceClient } from './MarketplaceClient'

export default async function AdminMarketplacePage() {
  const supabase = createAdminClient()
  const [{ data: products }, { data: ebooks }] = await Promise.all([
    supabase
      .from('marketplace_products')
      .select('id, slug, title, description, category, price, original_price, cover_url, product_url, is_published, ebook_id')
      .order('sort_order'),
    supabase
      .from('ebooks')
      .select('id, title')
      .eq('is_published', true)
      .order('title'),
  ])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <MarketplaceClient products={products ?? []} ebooks={ebooks ?? []} />
    </div>
  )
}
