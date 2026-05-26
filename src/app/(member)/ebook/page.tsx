import { Suspense } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { EbookCard } from '@/components/member/EbookCard'
import { CategoryFilter } from '@/components/member/CategoryFilter'

interface EbookPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function EbookPage({ searchParams }: EbookPageProps) {
  const { category } = await searchParams
  const supabase = await createServerClient()

  let query = supabase
    .from('ebooks')
    .select('id, slug, title, category, cover_url')
    .eq('is_published', true)
    .order('sort_order')

  if (category) {
    query = query.eq('category', category)
  }

  const { data: ebooks, error } = await query
  if (error) throw error

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F5F5F0] mb-1">Library Ebook</h1>
        <p className="text-[#888888] text-sm">{ebooks?.length ?? 0} ebook tersedia</p>
      </div>

      <div className="mb-6">
        <Suspense fallback={null}>
          <CategoryFilter activeCategory={category} />
        </Suspense>
      </div>

      {ebooks && ebooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {ebooks.map((ebook) => (
            <EbookCard
              key={ebook.id}
              slug={ebook.slug}
              title={ebook.title}
              category={ebook.category}
              cover_url={ebook.cover_url}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-[#888888]">Tidak ada ebook di kategori ini.</p>
        </div>
      )}
    </div>
  )
}
