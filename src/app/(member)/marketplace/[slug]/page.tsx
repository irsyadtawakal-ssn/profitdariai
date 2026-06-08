import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MarketplaceProductDetail } from '@/components/member/MarketplaceProductDetail'

export default async function MarketplaceProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const adminClient = createAdminClient()
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [productRes, ownedRes, profileRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (adminClient as any)
      .from('marketplace_products')
      .select('id, slug, title, description, category, price, original_price, cover_url, product_url, ebook_id, features')
      .eq('slug', slug)
      .eq('is_published', true)
      .single(),
    user
      ? supabase.from('user_ebooks').select('ebook_id').eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from('profiles').select('email, full_name').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  if (!productRes.data) notFound()

  const product = productRes.data
  const ownedEbookIds = new Set((ownedRes.data ?? []).map((r: { ebook_id: string }) => r.ebook_id))
  const isOwned = product.ebook_id ? ownedEbookIds.has(product.ebook_id) : false
  const profile = profileRes.data

  return (
    <MarketplaceProductDetail
      product={{ ...product, isOwned, features: product.features ?? [] }}
      userEmail={profile?.email ?? user?.email ?? ''}
      userFullName={profile?.full_name ?? ''}
    />
  )
}
