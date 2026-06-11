'use client'

import { ShoppingBag, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ProductDetail {
  id: string
  slug: string
  title: string
  description: string | null
  category: string
  price: number
  original_price: number | null
  cover_url: string | null
  product_url: string
  ebook_id: string | null
  isOwned: boolean
  features: string[]
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function MarketplaceProductDetail({
  product,
  userEmail,
  userFullName,
}: {
  product: ProductDetail
  userEmail: string
  userFullName: string
}) {
  return (
    <div className="p-6 max-w-2xl mx-auto pt-8 pb-16 space-y-8">

      {/* Back */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 font-mono text-[10px] text-[#888888] hover:text-[#D4AF37] uppercase tracking-wider transition-colors"
      >
        <ArrowLeft size={12} />
        Kembali ke Marketplace
      </Link>

      {/* Cover */}
      <div className="w-full aspect-[4/3] bg-[#161616] border border-[#D4AF37]/15 overflow-hidden rounded-none">
        {product.cover_url ? (
          <img
            src={product.cover_url}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1808] to-[#161208]">
            <ShoppingBag className="w-16 h-16 text-[#D4AF37]/20" />
          </div>
        )}
      </div>

      {/* Header */}
      <div className="space-y-3">
        <span className="inline-block bg-[#D4AF37] text-[#0A0A0A] font-mono text-[9px] font-bold px-3 py-1 uppercase tracking-wider">
          {product.category}
        </span>
        <h1 className="font-display text-2xl md:text-3xl font-black text-white leading-tight">
          {product.title}
        </h1>
        <div className="flex items-baseline gap-3">
          <span className="text-xl font-mono text-[#D4AF37] font-bold">{formatPrice(product.price)}</span>
          {product.original_price && (
            <span className="text-sm font-mono text-[#888888] line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="space-y-2">
          <p className="font-mono text-[9px] text-[#D4AF37] uppercase tracking-widest">Deskripsi</p>
          <p className="text-sm text-[#AAAAAA] leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* Features */}
      {product.features.length > 0 && (
        <div className="space-y-3 border border-[#D4AF37]/15 bg-[#0E0E0E] p-6">
          <p className="font-mono text-[9px] text-[#D4AF37] uppercase tracking-widest mb-4">Apa yang Kamu Dapat</p>
          <ul className="space-y-3">
            {product.features.map((feat, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#F5F5F0]">{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <div>
        {product.isOwned ? (
          <Link
            href="/materi"
            className="w-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] py-4 text-[11px] font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 rounded-none"
          >
            <CheckCircle size={14} />
            Buka di Library
          </Link>
        ) : product.ebook_id ? (
          <a
            href="https://lynk.id/spbaicreator/mmy8445nreq8"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#D4AF37] text-[#0A0A0A] py-4 text-[11px] font-mono font-bold tracking-wider uppercase hover:bg-[#D4AF37]/90 transition-all duration-300 flex items-center justify-center gap-2 rounded-none shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          >
            Beli Sekarang — {formatPrice(product.price)}
          </a>
        ) : (
          <span className="w-full text-center text-[#555] py-4 text-[11px] font-mono uppercase tracking-wider border border-[#333] rounded-none block">
            Segera Hadir
          </span>
        )}
      </div>
    </div>
  )
}
