import { Suspense } from 'react'
import { getCachedCourses } from '@/lib/cache/content'
import { CourseCard } from '@/components/member/CourseCard'
import { CategoryFilter } from '@/components/member/CategoryFilter'

interface KursusPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function KursusPage({ searchParams }: KursusPageProps) {
  const { category } = await searchParams
  const courses = await getCachedCourses(category)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pt-8">
      <div>
        <span className="font-mono text-[9px] text-[#D4AF37] tracking-[0.2em] block mb-2 uppercase">Katalog Premium</span>
        <h2 className="text-2xl md:text-3xl font-black text-white leading-none tracking-tight font-display">Daftar Kursus</h2>
        <p className="text-[#888888] text-xs mt-2 font-mono">{courses.length} KURSUS TERSEDIA</p>
      </div>

      <div className="mb-6">
        <Suspense fallback={null}>
          <CategoryFilter activeCategory={category} />
        </Suspense>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {courses.map((course) => {
            const modules = course.course_modules as { count: number }[]
            return (
              <CourseCard
                key={course.id}
                slug={course.slug}
                title={course.title}
                category={course.category}
                thumbnail_url={course.thumbnail_url}
                moduleCount={modules[0]?.count ?? 0}
              />
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-[#888888]">Tidak ada kursus di kategori ini.</p>
        </div>
      )}
    </div>
  )
}
