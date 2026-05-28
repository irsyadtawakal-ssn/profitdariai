import { createServerClient } from '@/lib/supabase/server'
import { getCachedCourses, getCachedEbooks, getCachedCourseCounts } from '@/lib/cache/content'
import { isMembershipActive } from '@/lib/membership'
import { CourseCard } from '@/components/member/CourseCard'
import { EbookCard } from '@/components/member/EbookCard'
import { RenewalBanner } from '@/components/member/RenewalBanner'
import Link from 'next/link'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: profile },
    allCourses,
    allEbooks,
    { courseCount, ebookCount },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name, membership_expires_at').eq('id', user!.id).single(),
    getCachedCourses(),
    getCachedEbooks(),
    getCachedCourseCounts(),
  ])

  const courses = allCourses.slice(0, 3)
  const ebooks = allEbooks.slice(0, 3)

  const isActive = isMembershipActive({ membership_expires_at: profile?.membership_expires_at ?? null })
  const expiryLabel = profile?.membership_expires_at
    ? format(new Date(profile.membership_expires_at), 'd MMMM yyyy', { locale: id })
    : null

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {profile?.membership_expires_at && <RenewalBanner expiresAt={profile.membership_expires_at} />}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F5F5F0] mb-1">
          Halo, {profile?.full_name ?? 'Member'}!
        </h1>
        <p className="text-[#888888]">Selamat belajar hari ini.</p>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 mb-6 flex items-center gap-3">
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-red-900/30 text-red-400'
          }`}
        >
          {isActive ? 'Member Aktif' : 'Expired'}
        </span>
        {expiryLabel && (
          <span className="text-[#888888] text-sm">
            {isActive ? `Aktif sampai ${expiryLabel}` : `Berakhir ${expiryLabel}`}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: 'Kursus', value: courseCount ?? 0 },
          { label: 'Ebook', value: ebookCount ?? 0 },
          { label: 'Akses', value: 'Penuh' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#111111] border border-[#222222] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#D4AF37]">{value}</div>
            <div className="text-[#888888] text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#F5F5F0]">Kursus Terbaru</h2>
          <Link href="/kursus" className="text-[#D4AF37] text-sm hover:underline">Lihat Semua →</Link>
        </div>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {courses.map((course) => {
              const modules = course.course_modules as unknown as [{ count: number }]
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
          <p className="text-[#888888] text-sm">Konten segera hadir.</p>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#F5F5F0]">Ebook Terbaru</h2>
          <Link href="/ebook" className="text-[#D4AF37] text-sm hover:underline">Lihat Semua →</Link>
        </div>
        {ebooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
          <p className="text-[#888888] text-sm">Konten segera hadir.</p>
        )}
      </section>
    </div>
  )
}
