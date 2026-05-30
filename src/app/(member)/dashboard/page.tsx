import { Suspense } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { getCachedEbooks, getCachedCourseCounts } from '@/lib/cache/content'
import { isMembershipActive } from '@/lib/membership'
import { MateriCard } from '@/components/member/MateriCard'
import { FeaturedMateri } from '@/components/member/FeaturedMateri'
import Link from 'next/link'

const QUOTES = [
  'Investasi terbaik adalah investasi pada diri sendiri.',
  'Setiap hari adalah kesempatan untuk belajar sesuatu yang baru.',
  'AI bukan pengganti manusia — AI adalah alat bagi manusia yang mau belajar.',
  'Konsistensi mengalahkan motivasi. Buka satu materi hari ini.',
]

async function MemberHero() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, membership_expires_at')
    .eq('id', user!.id)
    .single()

  const isActive = isMembershipActive({ membership_expires_at: profile?.membership_expires_at ?? null })
  const quote = QUOTES[new Date().getDate() % QUOTES.length]

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#2E2800] mb-8" style={{
      background: 'linear-gradient(135deg, #161208 0%, #0A0A0A 55%, #100E04 100%)',
    }}>
      {/* Gold glow top-right */}
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: '#D4AF37', filter: 'blur(60px)', opacity: 0.12 }} />
      {/* Subtle glow bottom-center */}
      <div className="absolute -bottom-6 left-1/3 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: '#D4AF37', filter: 'blur(50px)', opacity: 0.05 }} />

      <div className="relative p-7 md:p-8">
        <p className="text-[#666] text-[10px] font-semibold uppercase tracking-[1.5px] mb-2">
          Selamat datang kembali
        </p>
        <h1 className="text-[28px] md:text-[32px] font-black tracking-tight leading-none mb-2">
          Halo, <span className="text-[#D4AF37]">{profile?.full_name ?? 'Member'}!</span>
        </h1>
        <p className="text-[#555] text-xs italic mb-6">&ldquo;{quote}&rdquo;</p>

        <div className="flex items-center gap-3 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${
            isActive
              ? 'bg-[#D4AF37] text-[#0A0A0A]'
              : 'bg-red-900/30 text-red-400 border border-red-800/40'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {isActive ? 'MEMBER AKTIF' : 'EXPIRED'}
          </span>
          <span className="text-[#444] text-xs hidden sm:block">|</span>
          <span className="text-[#888] text-xs">
            Akses ke seluruh materi tersedia
          </span>
        </div>
      </div>
    </div>
  )
}

function MemberHeroSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#1E1E1E] bg-[#0E0E0E] p-7 md:p-8 mb-8">
      <div className="h-3 w-40 bg-[#1A1A1A] rounded mb-3" />
      <div className="h-9 w-64 bg-[#1A1A1A] rounded-lg mb-2" />
      <div className="h-3 w-80 bg-[#1A1A1A] rounded mb-6" />
      <div className="flex items-center gap-3">
        <div className="h-7 w-28 bg-[#1A1A1A] rounded-full" />
        <div className="h-3 w-36 bg-[#1A1A1A] rounded" />
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const [allMateris, { ebookCount }] = await Promise.all([
    getCachedEbooks(),
    getCachedCourseCounts(),
  ])

  const featuredMateri = allMateris.find((m) => m.is_featured) ?? null
  const recentMateris = allMateris.filter((m) => !m.is_featured).slice(0, 3)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Hero — streams in, user-specific */}
      <Suspense fallback={<MemberHeroSkeleton />}>
        <MemberHero />
      </Suspense>

      {/* Materi Pilihan — hanya tampil jika ada is_featured */}
      {featuredMateri && (
        <section className="mb-10">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#888] mb-3">
            Materi Pilihan
          </h2>
          <FeaturedMateri
            slug={featuredMateri.slug}
            title={featuredMateri.title}
            category={featuredMateri.category}
            cover_url={featuredMateri.cover_url}
            description={featuredMateri.description ?? null}
          />
        </section>
      )}

      {/* Materi Terbaru */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#888]">
            Materi Terbaru
          </h2>
          <Link
            href="/materi"
            className="text-[#D4AF37] text-xs font-semibold hover:underline"
          >
            Lihat Semua ({ebookCount}) →
          </Link>
        </div>
        {recentMateris.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentMateris.map((materi) => (
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
          <p className="text-[#555] text-sm">Konten segera hadir.</p>
        )}
      </section>
    </div>
  )
}
