import { createAdminClient } from '@/lib/supabase/admin'
import { KursusClient } from './KursusClient'

export default async function AdminKursusPage() {
  const supabase = createAdminClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('id, slug, title, description, category, thumbnail_url, is_published, course_modules(count)')
    .order('sort_order')

  const mapped = (courses ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    category: c.category,
    thumbnail_url: c.thumbnail_url,
    is_published: c.is_published,
    moduleCount: (c.course_modules as unknown as [{ count: number }])[0]?.count ?? 0,
  }))

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <KursusClient courses={mapped} />
    </div>
  )
}
