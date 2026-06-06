import { Suspense } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { getCachedEbooks } from '@/lib/cache/content'
import { MateriCard } from '@/components/member/MateriCard'
import { CategoryFilter } from '@/components/member/CategoryFilter'

interface MateriPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function MateriPage({ searchParams }: MateriPageProps) {
  const { category } = await searchParams

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all published ebooks + user's owned ebooks in parallel
  const [allMateris, ownedRes] = await Promise.all([
    getCachedEbooks(category),
    user
      ? supabase
          .from('user_ebooks')
          .select('ebook_id')
          .eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
  ])

  const ownedIds = new Set((ownedRes.data ?? []).map((r) => r.ebook_id))
  const totalOwned = ownedIds.size

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pt-8">
      {/* Header */}
      <div>
        <span className="font-mono text-[9px] text-[#D4AF37] tracking-[0.2em] block mb-2 uppercase">
          Library Kamu
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-white leading-none tracking-tight font-display">
          Materi Pembelajaran
        </h2>
        <div className="flex items-center gap-4 mt-2">
          <p className="text-[#888888] text-xs font-mono">
            {allMateris.length} ITEM TERSEDIA
          </p>
          {totalOwned > 0 && (
            <>
              <span className="text-[#333]">·</span>
              <p className="text-[#D4AF37] text-xs font-mono font-bold">
                {totalOwned} DIMILIKI
              </p>
            </>
          )}
        </div>
      </div>

      {/* Filter Kategori */}
      <Suspense fallback={null}>
        <CategoryFilter activeCategory={category} />
      </Suspense>

      {/* Grid Materi — semua ditampilkan, locked jika belum dibeli */}
      {allMateris.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {allMateris.map((materi) => (
            <MateriCard
              key={materi.id}
              slug={materi.slug}
              title={materi.title}
              category={materi.category}
              cover_url={materi.cover_url}
              isLocked={!ownedIds.has(materi.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-[#888888]">Tidak ada materi di kategori ini.</p>
        </div>
      )}
    </div>
  )
}
