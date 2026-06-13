import { createAdminClient } from '@/lib/supabase/admin'
import { LandingClient } from './LandingClient'

export default async function AdminLandingPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data: pages } = await supabase
    .from('landing_pages')
    .select('id, slug, title, html, published')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <LandingClient pages={pages ?? []} />
    </div>
  )
}
