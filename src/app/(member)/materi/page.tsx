import { Suspense } from 'react'
import { getCachedEbooks } from '@/lib/cache/content'
import { MateriCard } from '@/components/member/MateriCard'
import { CategoryFilter } from '@/components/member/CategoryFilter'

interface MateriPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function MateriPage({ searchParams }: MateriPageProps) {
  const { category } = await searchParams
  const materis = await getCachedEbooks(category)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F5F5F0] mb-1">Library Materi</h1>
        <p className="text-[#888888] text-sm">{materis.length} materi tersedia</p>
      </div>

      <div className="mb-6">
        <Suspense fallback={null}>
          <CategoryFilter activeCategory={category} />
        </Suspense>
      </div>

      {materis.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {materis.map((materi) => (
            <MateriCard
              key={materi.id}
              slug={materi.slug}
              title={materi.title}
              category={materi.category}
              cover_url={materi.cover_url}
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
