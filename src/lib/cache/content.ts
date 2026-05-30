import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export const getCachedCourses = unstable_cache(
  async (category?: string) => {
    const supabase = createAdminClient()
    let query = supabase
      .from('courses')
      .select('id, slug, title, category, thumbnail_url, course_modules(count)')
      .eq('is_published', true)
      .order('sort_order')

    if (category) query = query.eq('category', category)

    const { data } = await query
    return data ?? []
  },
  ['courses-published'],
  { revalidate: 60 }
)

export type CachedEbook = {
  id: string
  slug: string
  title: string
  category: string
  cover_url: string | null
  description: string | null
  is_featured: boolean | null
}

export const getCachedEbooks = unstable_cache(
  async (category?: string): Promise<CachedEbook[]> => {
    const supabase = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('ebooks')
      .select('id, slug, title, category, cover_url, description, is_featured')
      .eq('is_published', true)
      .order('sort_order')

    if (category) query = query.eq('category', category)

    const { data } = await query
    return (data ?? []) as CachedEbook[]
  },
  ['ebooks-published'],
  { revalidate: 60 }
)

export const getCachedCourseCounts = unstable_cache(
  async () => {
    const supabase = createAdminClient()
    const [{ count: courseCount }, { count: ebookCount }] = await Promise.all([
      supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('ebooks').select('*', { count: 'exact', head: true }).eq('is_published', true),
    ])
    return { courseCount: courseCount ?? 0, ebookCount: ebookCount ?? 0 }
  },
  ['content-counts'],
  { revalidate: 60 }
)
