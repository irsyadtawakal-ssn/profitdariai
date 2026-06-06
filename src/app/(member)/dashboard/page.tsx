import { Suspense } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { getCachedEbooks, getCachedCourseCounts } from '@/lib/cache/content'
import { MateriCard } from '@/components/member/MateriCard'
import { FeaturedMateri } from '@/components/member/FeaturedMateri'
import Link from 'next/link'
import {
  CheckCircle,
  GraduationCap,
  Clock,
  ChevronRight
} from 'lucide-react'

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
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const quote = QUOTES[new Date().getDate() % QUOTES.length]

  return (
    <div className="relative overflow-hidden glass-panel p-8 md:p-12 mb-8 rounded-none border border-primary/20">
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAmV8xfSWoGUGN8-hUssf6NsDa6wtrB0nJoDfRJR8qdNK1fY6AWbaKGzwO9W-nzG5PRSvPDMyBAzJMYX5CShcCAaFf0q-_-GPuFWMXH8GTlkkDwDw0om4h5udcosWrp1prD2VYFMKxvlRjXlSLz9Uq3vPUNmEVvdV6DmSO5AheZ7ho1SLNkGEP0qmcW4fhvEdvD6mNWoeM8jDd7H8GISuOPCM5PhMsIK6X1wy9gGmMew75X481h75HGbjamnDni2T3eFCRWzTE1jVs')"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent pointer-events-none" />

      {/* Crop Brackets */}
      <div className="absolute top-0 left-0 w-5 h-5 border-l-2 border-t-2 border-[#F5F5F0] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-r-2 border-b-2 border-[#F5F5F0] pointer-events-none" />

      <div className="relative z-10">
        <div className="inline-flex items-center px-3 py-1 bg-primary/10 border border-primary/30 rounded-none mb-6">
          <CheckCircle className="w-3.5 h-3.5 text-primary mr-2" />
          <span className="font-mono text-[9px] text-primary tracking-[0.2em] font-bold uppercase">
            MEMBER AKTIF
          </span>
        </div>

        <h2 className="text-[28px] md:text-[36px] font-black tracking-tight leading-none mb-4 font-display text-white gold-glow-text">
          Selamat Datang Kembali,<br />
          <span className="text-primary italic">Halo {profile?.full_name ?? 'Member'}!</span>
        </h2>
        <p className="text-[#888888] text-sm mb-8 max-w-2xl leading-relaxed font-sans">
          &ldquo;{quote}&rdquo;
        </p>

        <div className="flex flex-wrap gap-4">
          <Link href="/materi" className="px-8 py-4 bg-primary text-on-primary font-bold font-mono text-[10px] tracking-wider hover:brightness-110 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all rounded-none">
            MULAI BELAJAR
          </Link>
          <Link href="/ebook" className="px-8 py-4 border border-primary/40 text-primary font-bold font-mono text-[10px] tracking-wider hover:bg-primary hover:text-on-primary transition-all rounded-none">
            LIHAT PANDUAN
          </Link>
        </div>
      </div>
    </div>
  )
}

function MemberHeroSkeleton() {
  return (
    <div className="animate-pulse bg-[#0E0E0E] border border-primary/20 p-8 mb-8 cyber-corner relative">
      <div className="h-5 w-32 bg-[#1A1A1A] rounded-none mb-6" />
      <div className="h-9 w-64 bg-[#1A1A1A] rounded-none mb-3" />
      <div className="h-9 w-48 bg-[#1A1A1A] rounded-none mb-3" />
      <div className="h-4 w-80 bg-[#1A1A1A] rounded-none mb-8" />
      <div className="flex gap-4">
        <div className="h-10 w-32 bg-[#1A1A1A] rounded-none" />
        <div className="h-10 w-32 bg-[#1A1A1A] rounded-none" />
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

  // 4 materi terbaru (exclude featured agar tidak duplikat)
  const newestMateris = allMateris
    .filter((m) => m.id !== featuredMateri?.id)
    .slice(0, 4)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      {/* Hero Welcome Banner */}
      <Suspense fallback={<MemberHeroSkeleton />}>
        <MemberHero />
      </Suspense>

      {/* Featured Section & Sidebar widgets (Bento Grid Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Materi Pilihan */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 font-mono">
              <GraduationCap className="w-4 h-4 text-primary" />
              Materi Pilihan
            </h3>
          </div>

          {featuredMateri ? (
            <FeaturedMateri
              slug={featuredMateri.slug}
              title={featuredMateri.title}
              category={featuredMateri.category}
              cover_url={featuredMateri.cover_url}
              description={featuredMateri.description ?? null}
            />
          ) : (
            <div className="glass-panel p-8 flex items-center justify-center text-[#555] text-sm cyber-corner">
              Materi pilihan belum dikonfigurasi.
            </div>
          )}
        </div>

        {/* Right: Quick Stats Widget */}
        <div className="lg:col-span-1 flex flex-col justify-between gap-6">
          <div className="flex flex-col flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#888] flex items-center gap-2 mb-4 font-mono">
              <Clock className="w-4 h-4 text-primary" />
              Konten Tersedia
            </h3>

            <div className="flex-1 glass-panel p-6 flex flex-col items-center justify-center text-center border-dashed border-primary/20 bg-black/40 cyber-corner">
              <div className="w-12 h-12 bg-[#1A1A1A] flex items-center justify-center mb-4 border border-[#222]/50">
                <Clock className="w-5 h-5 text-muted" />
              </div>
              <h5 className="font-bold text-sm text-[#F5F5F0] mb-2 font-display">Konten segera hadir</h5>
              <p className="text-xs text-muted mb-4 max-w-[200px]">
                Tim kami sedang mengkurasi konten AI terbaik khusus untuk Anda.
              </p>
              <div className="w-full h-1.5 bg-[#1A1A1A] rounded-none overflow-hidden mb-3">
                <div className="h-full bg-primary/30 w-1/3 animate-pulse" />
              </div>
              <p className="font-mono text-[9px] text-primary/40 tracking-widest uppercase">Syncing with Mainframe...</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass-panel p-5 flex items-center justify-between cyber-corner">
            <div>
              <p className="text-[9px] font-mono text-[#888] mb-1">TOTAL MATERI</p>
              <p className="text-lg font-bold text-primary font-display">{ebookCount}<span className="text-[10px] font-mono ml-1 text-muted">Items</span></p>
            </div>
            <div className="w-[1px] h-8 bg-border/40" />
            <div className="text-right">
              <p className="text-[9px] font-mono text-[#888] mb-1">STATUS</p>
              <p className="text-lg font-bold text-[#F5F5F0] font-display text-sm">ACTIVE</p>
            </div>
          </div>
        </div>
      </div>

      {/* Materi Terbaru — menggantikan "Fitur Eksklusif Member" */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] text-primary tracking-[0.2em] block uppercase">Baru Ditambahkan</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F0] font-mono mt-0.5">Materi Terbaru</h3>
          </div>
          <Link
            href="/materi"
            className="text-primary text-xs font-semibold hover:underline flex items-center gap-1 font-mono"
          >
            Lihat Semua ({ebookCount}) <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {newestMateris.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {newestMateris.map((materi) => (
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
          <p className="text-muted text-sm glass-panel p-6 cyber-corner">Konten segera hadir.</p>
        )}
      </section>
    </div>
  )
}
