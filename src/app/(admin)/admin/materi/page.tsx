import { createAdminClient } from '@/lib/supabase/admin'
import { MateriClient } from './MateriClient'

interface Materi {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  cover_url: string | null
  file_path: string
  page_count: number | null
  is_published: boolean
  is_featured: boolean | null
  is_bump_product: boolean | null
  bump_price: number | null
  videos: { title: string; url: string }[] | null
  documents: { title: string; url: string }[] | null
  drive_folder_url: string | null
}

export default async function AdminMateriPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data: ebooks } = await supabase
    .from('ebooks')
    .select('id, slug, title, description, category, cover_url, file_path, page_count, is_published, is_featured, is_bump_product, bump_price, videos, documents, drive_folder_url')
    .order('sort_order')

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <MateriClient ebooks={(ebooks ?? []) as Materi[]} />
    </div>
  )
}
