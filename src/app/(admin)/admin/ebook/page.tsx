import { createAdminClient } from '@/lib/supabase/admin'
import { EbookClient } from './EbookClient'

export default async function AdminEbookPage() {
  const supabase = createAdminClient()
  const { data: ebooks } = await supabase
    .from('ebooks')
    .select('id, slug, title, description, category, cover_url, file_path, page_count, is_published')
    .order('sort_order')

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <EbookClient ebooks={ebooks ?? []} />
    </div>
  )
}
