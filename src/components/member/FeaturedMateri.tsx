import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

interface FeaturedMateriProps {
  slug: string
  title: string
  category: string
  cover_url: string | null
  description: string | null
}

export function FeaturedMateri({ slug, title, category, cover_url, description }: FeaturedMateriProps) {
  return (
    <Link href={`/materi/${slug}`} className="block group">
      <div className="relative overflow-hidden glass-panel p-5 flex gap-5 items-start cyber-corner">
        {/* Left gold accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#D4AF37] to-[#D4AF37]/20" />

        {/* Cover */}
        <div className="w-20 h-[100px] rounded-none overflow-hidden bg-[#1A1808] border border-primary/20 flex-shrink-0 relative">
          {cover_url ? (
            <Image
              src={cover_url}
              alt={title}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="24" height="32" viewBox="0 0 28 36" fill="none">
                <rect x="0.5" y="0.5" width="27" height="35" rx="3.5" stroke="#D4AF37" strokeOpacity="0.3"/>
                <rect x="4" y="8" width="14" height="2" rx="1" fill="#D4AF37" fillOpacity="0.3"/>
                <rect x="4" y="13" width="20" height="2" rx="1" fill="#D4AF37" fillOpacity="0.2"/>
                <rect x="4" y="18" width="16" height="2" rx="1" fill="#D4AF37" fillOpacity="0.2"/>
              </svg>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* "Pilihan Editor" badge top-right */}
          <span className="absolute top-4 right-5 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider font-mono">
            ★ Pilihan Editor
          </span>

          <Badge variant="gold" className="mb-2 text-[10px]">
            ⭐ {category}
          </Badge>
          <h3 className="text-[#F5F5F0] font-bold text-[15px] leading-snug mb-2 pr-24 font-display">
            {title}
          </h3>
          {description && (
            <p className="text-muted text-xs leading-relaxed mb-4 line-clamp-3">
              {description}
            </p>
          )}
          <span className="inline-block bg-[#D4AF37] text-[#0A0A0A] text-xs font-bold px-4 py-1.5 cyber-corner group-hover:bg-[#E5C84A] transition-all font-mono">
            Buka Materi →
          </span>
        </div>
      </div>
    </Link>
  )
}
