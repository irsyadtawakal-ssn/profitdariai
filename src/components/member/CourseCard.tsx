import Link from 'next/link'
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
      <div className="rounded-xl overflow-hidden bg-[#111111] border border-[#222222] hover:border-[#D4AF37]/40 transition-colors">
        <div className="aspect-video bg-[#1A1A1A] relative overflow-hidden">
          {thumbnail_url ? (
            <img
              src={thumbnail_url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[#444444] text-xs">No Thumbnail</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <Badge variant="gold" className="mb-2 text-xs">
            {category}
          </Badge>
          <h3 className="text-[#F5F5F0] font-semibold text-sm leading-snug line-clamp-2 mb-2">
            {title}
          </h3>
          <p className="text-[#888888] text-xs">{moduleCount} modul</p>
        </div>
      </div>
    </Link>
  )
}
