import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { DownloadButton } from '@/components/member/DownloadButton'
import { Badge } from '@/components/ui/badge'

interface EbookDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function EbookDetailPage({ params }: EbookDetailPageProps) {
  const { slug } = await params
  const supabase = await createServerClient()

  const { data: ebook } = await supabase
    .from('ebooks')
    .select('id, slug, title, description, category, cover_url, page_count')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!ebook) notFound()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-56 flex-shrink-0">
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#1A1A1A] border border-[#222222]">
            {ebook.cover_url ? (
              <img
                src={ebook.cover_url}
                alt={ebook.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[#D4AF37] text-4xl font-bold">E</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <Badge variant="gold" className="mb-3">
            {ebook.category}
          </Badge>
          <h1 className="text-2xl font-bold text-[#F5F5F0] mb-3">{ebook.title}</h1>
          {ebook.description && (
            <p className="text-[#888888] text-sm mb-4 leading-relaxed">{ebook.description}</p>
          )}
          {ebook.page_count && (
            <p className="text-[#555555] text-sm mb-6">{ebook.page_count} halaman · PDF</p>
          )}
          <DownloadButton ebookId={ebook.id} />
        </div>
      </div>
    </div>
  )
}
