import { createAdminClient } from '@/lib/supabase/admin'
import { MarketplaceClient } from './MarketplaceClient'

export default async function AdminMarketplacePage() {
  const supabase = createAdminClient()
  const { data: products } = await supabase
    .from('marketplace_products')
    .select('id, slug, title, description, category, price, original_price, cover_url, product_url, is_published')
    .order('sort_order')

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <MarketplaceClient products={products ?? []} />
    </div>
  )
}
