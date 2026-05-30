import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

interface MateriCardProps {
  slug: string
  title: string
  category: string
  cover_url: string | null
}

export function MateriCard({ slug, title, category, cover_url }: MateriCardProps) {
  return (
    <Link href={`/materi/${slug}`} className="block group">
      <div className="rounded-xl overflow-hidden bg-[#0E0E0E] border border-[#1A1A1A] hover:border-[#D4AF37]/30 transition-all hover:-translate-y-0.5 duration-200">
        <div className="aspect-[3/2] bg-[#161616] relative overflow-hidden">
          {cover_url ? (
            <Image
              src={cover_url}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1808] to-[#161208]">
              <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
                <rect x="0.5" y="0.5" width="27" height="35" rx="3.5" stroke="#D4AF37" strokeOpacity="0.2"/>
                <rect x="4" y="8" width="14" height="2" rx="1" fill="#D4AF37" fillOpacity="0.2"/>
                <rect x="4" y="13" width="20" height="2" rx="1" fill="#D4AF37" fillOpacity="0.15"/>
                <rect x="4" y="18" width="16" height="2" rx="1" fill="#D4AF37" fillOpacity="0.15"/>
                <rect x="4" y="23" width="10" height="2" rx="1" fill="#D4AF37" fillOpacity="0.1"/>
              </svg>
            </div>
          )}
        </div>
        <div className="p-3">
          <Badge variant="gold" className="mb-2 text-[10px]">
            {category}
          </Badge>
          <h3 className="text-[#F5F5F0] font-semibold text-sm leading-snug line-clamp-2">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  )
}
