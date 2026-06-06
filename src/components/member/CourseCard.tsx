import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

interface CourseCardProps {
  slug: string
  title: string
  category: string
  thumbnail_url: string | null
  moduleCount: number
}

export function CourseCard({ slug, title, category, thumbnail_url, moduleCount }: CourseCardProps) {
  return (
    <Link href={`/kursus/${slug}`} className="block group">
      <div className="rounded-none overflow-hidden glass-panel hover:border-primary/50 transition-all duration-300 flex flex-col h-full bg-[#0E0E0E]">
        <div className="aspect-[4/3] bg-[#161616] relative overflow-hidden border-b border-primary/10">
          {thumbnail_url ? (
            <Image
              src={thumbnail_url}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1808] to-[#161208]">
              <span className="text-[#D4AF37]/40 text-xs font-mono">NO IMAGE</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
          <span className="absolute top-3 right-3 bg-[#D4AF37] text-[#0A0A0A] font-mono text-[8px] font-bold px-2 py-0.5 tracking-wider uppercase">
            COURSE
          </span>
        </div>
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <Badge variant="gold" className="mb-2 text-[9px]">
              {category}
            </Badge>
            <h3 className="text-[#F5F5F0] font-bold text-[14px] leading-snug group-hover:text-[#D4AF37] transition-colors line-clamp-2 font-display">
              {title}
            </h3>
          </div>
          <div className="mt-4 pt-3 border-t border-primary/5 flex items-center justify-between">
            <span className="text-[#888888] font-mono text-[9px] uppercase">{moduleCount} Modul</span>
            <span className="text-[#D4AF37] font-bold font-mono text-[9px] tracking-wider uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Belajar <span className="text-[11px] font-sans">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
