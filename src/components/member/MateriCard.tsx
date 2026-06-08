import Link from 'next/link'
import Image from 'next/image'
import { Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface MateriCardProps {
  slug: string
  title: string
  category: string
  cover_url: string | null
  isLocked?: boolean
  marketplaceSlug?: string
}

export function MateriCard({ slug, title, category, cover_url, isLocked = false, marketplaceSlug }: MateriCardProps) {
  const lockedHref = marketplaceSlug ? `/marketplace/${marketplaceSlug}` : '/marketplace'
  const href = isLocked ? lockedHref : `/materi/${slug}`

  return (
    <Link href={href} className="block group">
      <div className="rounded-none overflow-hidden glass-panel hover:border-primary/50 transition-all duration-300 flex flex-col h-full">
        <div className="aspect-[3/4] bg-[#161616] relative overflow-hidden border-b border-primary/10">
          {cover_url ? (
            <Image
              src={cover_url}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-transform duration-500 ${isLocked ? 'scale-105 blur-[1px]' : 'group-hover:scale-105'}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1808] to-[#161208]">
              <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
                <rect x="0.5" y="0.5" width="27" height="35" stroke="#D4AF37" strokeOpacity="0.2"/>
                <rect x="4" y="8" width="14" height="2" fill="#D4AF37" fillOpacity="0.2"/>
                <rect x="4" y="13" width="20" height="2" fill="#D4AF37" fillOpacity="0.15"/>
                <rect x="4" y="18" width="16" height="2" fill="#D4AF37" fillOpacity="0.15"/>
              </svg>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

          {isLocked ? (
            <>
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 group-hover:bg-black/70 transition-colors">
                <div className="w-10 h-10 rounded-none bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <span className="font-mono text-[8px] text-[#D4AF37] tracking-widest uppercase opacity-80">
                  Beli di Marketplace
                </span>
              </div>
              <span className="absolute top-3 right-3 bg-[#888888]/80 text-white font-mono text-[8px] font-bold px-2 py-0.5 tracking-wider uppercase">
                LOCKED
              </span>
            </>
          ) : (
            <span className="absolute top-3 right-3 bg-[#D4AF37] text-[#0A0A0A] font-mono text-[8px] font-bold px-2 py-0.5 tracking-wider uppercase">
              E-BOOK
            </span>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <Badge variant={isLocked ? 'muted' : 'gold'} className="mb-2 text-[9px]">
              {category}
            </Badge>
            <h3 className={`font-bold text-[14px] leading-snug line-clamp-2 font-display transition-colors ${
              isLocked
                ? 'text-[#888888] group-hover:text-[#AAAAAA]'
                : 'text-[#F5F5F0] group-hover:text-[#D4AF37]'
            }`}>
              {title}
            </h3>
          </div>
          <div className="mt-4 pt-3 border-t border-primary/5 flex items-center justify-between">
            {isLocked ? (
              <>
                <span className="text-[#555555] font-mono text-[9px]">BELUM DIMILIKI</span>
                <span className="text-[#D4AF37] font-bold font-mono text-[9px] tracking-wider uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Beli <span className="text-[11px] font-sans">→</span>
                </span>
              </>
            ) : (
              <>
                <span className="text-[#888888] font-mono text-[9px]">DIMILIKI</span>
                <span className="text-[#D4AF37] font-bold font-mono text-[9px] tracking-wider uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Belajar <span className="text-[11px] font-sans">→</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
