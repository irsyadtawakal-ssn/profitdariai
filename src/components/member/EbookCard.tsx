import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

interface EbookCardProps {
  slug: string
  title: string
  category: string
  cover_url: string | null
}

export function EbookCard({ slug, title, category, cover_url }: EbookCardProps) {
  return (
    <Link href={`/ebook/${slug}`} className="block group">
      <div className="rounded-none overflow-hidden glass-panel hover:border-[#D4AF37]/50 transition-all duration-300 flex flex-col h-full">
        <div className="aspect-[3/4] bg-[#1A1A1A] relative overflow-hidden">
          {cover_url ? (
            <Image
              src={cover_url}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F]">
              <span className="text-[#D4AF37] text-2xl font-bold">E</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <Badge variant="gold" className="mb-1 text-xs">
            {category}
          </Badge>
          <h3 className="text-[#F5F5F0] font-semibold text-xs leading-snug line-clamp-2">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  )
}
