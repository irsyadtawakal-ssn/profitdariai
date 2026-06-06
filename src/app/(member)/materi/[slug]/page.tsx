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
    <div className="p-6 max-w-4xl mx-auto space-y-8 pt-8">

      {/* ① Hero Card */}
      <div
        className="relative rounded-none overflow-hidden border border-[#D4AF37]/20 p-8 flex flex-col md:flex-row gap-8 mb-6 bg-[#0E0E0E]"
      >
        {/* Underlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent pointer-events-none" />

        {/* Crop Brackets */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#F5F5F0] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#F5F5F0] pointer-events-none" />

        {/* Cover */}
        <div className="relative flex-shrink-0 self-center md:self-start">
          <div
            className="w-28 md:w-[120px] aspect-[3/4] rounded-none overflow-hidden bg-gradient-to-br from-[#1E1808] to-[#2A2208] border border-[#D4AF37]/20"
            style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
          >
            {materi.cover_url ? (
              <img
                src={materi.cover_url}
                alt={materi.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[#D4AF37] text-4xl font-black opacity-40 font-display">M</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="relative flex-1 flex flex-col justify-center">
          <div className="mb-3">
            <Badge variant="gold" className="text-[9px]">
              {materi.category}
            </Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight leading-tight text-[#F5F5F0] mb-3 font-display">
            {materi.title}
          </h1>
          {materi.page_count && (
            <p className="text-[#888888] font-mono text-xs mb-5 uppercase tracking-wide">
              {materi.page_count} HALAMAN • PDF FORMAT
            </p>
          )}
          <div className="md:max-w-xs">
            <DownloadButton ebookId={materi.id} />
          </div>
        </div>
      </div>

      {/* ② Deskripsi */}
      {materi.description && (
        <section className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] font-mono mb-3">
            // TENTANG MATERI
          </p>
          <div className="glass-panel rounded-none p-6 md:p-8">
            <p className="text-[#c4c7c7] text-sm leading-relaxed font-sans">{materi.description}</p>
          </div>
        </section>
      )}

      {/* ③ Video */}
      {videos && videos.length > 0 && (
        <section className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] font-mono mb-3">
            // VIDEO PENJELASAN
          </p>
          <div className="glass-panel rounded-none p-6 md:p-8">
            <MateriVideoPlayer videos={videos} />
          </div>
        </section>
      )}

      {/* ④ Dokumen Tambahan */}
      {documents && documents.length > 0 && (
        <section className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] font-mono mb-3">
            // DOKUMEN TAMBAHAN
          </p>
          <div className="glass-panel rounded-none p-6 md:p-8">
            <div className="flex flex-col gap-3">
              {documents.map((doc, index) => (
                <a
                  key={index}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-none bg-[#110E07] border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 hover:bg-[#1A1A1A] transition-all group"
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
