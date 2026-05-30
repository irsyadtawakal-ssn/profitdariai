import { createAdminClient } from '@/lib/supabase/admin'
import { MateriClient } from './MateriClient'

export default async function AdminMateriPage() {
  const supabase = createAdminClient()
  const { data: ebooks } = await supabase
    .from('ebooks')
    .select('id, slug, title, description, category, cover_url, file_path, page_count, is_published')
    .order('sort_order')

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <MateriClient ebooks={ebooks ?? []} />
    </div>
  )
}
