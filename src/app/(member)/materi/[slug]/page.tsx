import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { DownloadButton } from '@/components/member/DownloadButton'
import { MateriVideoPlayer, type VideoItem } from '@/components/member/MateriVideoPlayer'
import { Badge } from '@/components/ui/badge'

interface MateriDetailPageProps {
  params: Promise<{ slug: string }>
}

interface MateriData {
  id: string
  slug: string
  title: string
  description: string | null
  category: string
  cover_url: string | null
  page_count: number | null
  videos: unknown
  documents: unknown
}

export default async function MateriDetailPage({ params }: MateriDetailPageProps) {
  const { slug } = await params
  const supabase = await createServerClient()

  const { data } = await supabase
    .from('ebooks')
    .select('id, slug, title, description, category, cover_url, page_count, videos, documents')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  const materi = data as MateriData | null
  if (!materi) notFound()

  const videos = Array.isArray(materi.videos) ? (materi.videos as VideoItem[]) : null
  type DocumentItem = { title: string; url: string }
  const documents = Array.isArray(materi.documents) ? (materi.documents as DocumentItem[]) : null

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* ① Hero Card */}
      <div
        className="relative rounded-2xl overflow-hidden border border-[#2A2200] p-6 flex flex-col md:flex-row gap-6 mb-6"
        style={{ background: 'linear-gradient(135deg, #161208 0%, #0F0D04 100%)' }}
      >
        {/* Gold radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(212,175,55,0.06) 0%, transparent 60%)' }}
        />

        {/* Cover */}
        <div className="relative flex-shrink-0 self-center md:self-start">
          <div
            className="w-28 md:w-[120px] aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-[#1E1808] to-[#2A2208] border border-[#2E2400]"
            style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.1)' }}
          >
            {materi.cover_url ? (
              <img
                src={materi.cover_url}
                alt={materi.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[#D4AF37] text-4xl font-black opacity-40">M</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="relative flex-1">
          <Badge variant="gold" className="mb-3">{materi.category}</Badge>
          <h1 className="text-[22px] font-black tracking-tight leading-tight text-[#F5F5F0] mb-3">
            {materi.title}
          </h1>
          {materi.page_count && (
            <p className="text-[#555] text-sm mb-5">{materi.page_count} halaman · PDF</p>
          )}
          <div className="md:max-w-xs">
            <DownloadButton ebookId={materi.id} />
          </div>
        </div>
      </div>

      {/* ② Deskripsi */}
      {materi.description && (
        <section className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-3">
            Tentang Materi
          </p>
          <div className="bg-[#0E0E0E] border border-[#1A1A1A] rounded-xl p-5 md:p-6">
            <p className="text-[#999] text-sm leading-relaxed">{materi.description}</p>
          </div>
        </section>
      )}

      {/* ③ Video */}
      {videos && videos.length > 0 && (
        <section className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-3">
            Video Penjelasan
          </p>
          <div className="bg-[#0E0E0E] border border-[#1A1A1A] rounded-xl p-5 md:p-6">
            <MateriVideoPlayer videos={videos} />
          </div>
        </section>
      )}

      {/* ④ Dokumen Tambahan */}
      {documents && documents.length > 0 && (
        <section className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-3">
            Dokumen Tambahan
          </p>
          <div className="bg-[#0E0E0E] border border-[#1A1A1A] rounded-xl p-5 md:p-6">
            <div className="flex flex-col gap-3">
              {documents.map((doc, index) => (
                <a
                  key={index}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#111] border border-[#1E1E1E] hover:border-[#D4AF37]/30 transition-colors group"
                >
                  <svg className="w-5 h-5 text-[#D4AF37] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                  <span className="text-[#F5F5F0] text-sm font-medium flex-1 group-hover:text-[#D4AF37] transition-colors">
                    {doc.title}
                  </span>
                  <svg className="w-4 h-4 text-[#555] group-hover:text-[#D4AF37] transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
