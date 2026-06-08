'use client'

import { useState } from 'react'
import { ShoppingBag, Search, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface MarketplaceProduct {
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
}

interface MarketplaceClientProps {
  products: MarketplaceProduct[]
}

const CATEGORIES = ['ALL', 'MATERI', 'TOOLS', 'LAINNYA']

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function MarketplaceClient({ products }: MarketplaceClientProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')

  const filtered = products.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'ALL' || p.category.toUpperCase() === category
    return matchSearch && matchCat
  })

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pt-8 pb-16">
      {/* Title */}
      <div>
        <span className="font-mono text-[9px] text-[#D4AF37] tracking-[0.2em] block mb-2 uppercase">Etalase Digital</span>
        <h2 className="text-2xl md:text-3xl font-black text-white leading-none tracking-tight font-display">Marketplace</h2>
      </div>

      {/* Hero Header */}
      <section className="relative p-8 glass-panel rounded-none overflow-hidden bg-[#0E0E0E] border border-[#D4AF37]/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <p className="font-mono text-[9px] text-[#D4AF37] mb-2 tracking-widest uppercase">Eksklusif Member</p>
          <h3 className="text-lg md:text-xl font-bold text-white mb-2 font-display">Tambahkan ke Library Kamu</h3>
          <p className="text-xs text-[#888888] leading-relaxed">
            Dapatkan aset digital pilihan berupa e-book, kursus, dan modul masterclass yang dirancang khusus untuk membangun otomatisasi bisnis dan melipatgandakan profit menggunakan AI.
          </p>
        </div>
        <div className="flex-shrink-0 opacity-15">
          <ShoppingBag size={100} className="text-[#D4AF37]" />
        </div>
      </section>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-grow w-full">
          <label className="font-mono text-[9px] text-[#D4AF37] mb-2 block uppercase tracking-wider">Search Assets</label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari E-book, Kursus, atau Bundel..."
              className="w-full bg-[#110E07] border-b border-[#D4AF37]/35 focus:border-[#D4AF37] py-3 pl-10 pr-4 text-sm text-[#F5F5F0] placeholder-[#888888]/50 outline-none transition-all rounded-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37] w-4 h-4" />
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 p-1 bg-[#110E07] border border-[#D4AF37]/20">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 rounded-none whitespace-nowrap ${
                category === cat
                  ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                  : 'bg-transparent text-[#888888] hover:text-[#F5F5F0] hover:bg-[#1A1A1A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((prod) => (
            <Link
              key={prod.id}
              href={`/marketplace/${prod.slug}`}
              className="glass-panel group flex flex-col rounded-none overflow-hidden transition-all duration-300 border border-[#D4AF37]/15 bg-[#0E0E0E] hover:border-[#D4AF37]/40"
            >
              {/* Cover */}
              <div className="relative overflow-hidden bg-[#161616] border-b border-[#D4AF37]/10 aspect-[4/3]">
                {prod.cover_url ? (
                  <img
                    src={prod.cover_url}
                    alt={prod.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1808] to-[#161208]">
                    <ShoppingBag className="w-12 h-12 text-[#D4AF37]/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                {/* Category badge */}
                <span className="absolute top-4 right-4 bg-[#D4AF37] text-[#0A0A0A] font-mono text-[9px] font-bold px-3 py-1 uppercase tracking-wider">
                  {prod.category}
                </span>

                {/* OWNED badge overlay */}
                {prod.isOwned && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 bg-[#D4AF37]/20 border border-[#D4AF37]/60 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <span className="font-mono text-[9px] text-[#D4AF37] tracking-widest uppercase font-bold">
                      Sudah Dimiliki
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-6 flex flex-col flex-grow justify-between gap-4">
                <div>
                  <h4 className="font-display text-base font-bold text-white group-hover:text-[#D4AF37] transition-colors mb-2">
                    {prod.title}
                  </h4>
                  {prod.description && (
                    <p className="text-xs text-[#888888] leading-relaxed line-clamp-3 mb-4">
                      {prod.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-mono text-[#D4AF37] font-bold">{formatPrice(prod.price)}</span>
                    {prod.original_price && (
                      <span className="text-[10px] font-mono text-[#888888] line-through">
                        {formatPrice(prod.original_price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div className="w-full border border-[#D4AF37]/40 text-[#D4AF37] py-3 text-[10px] font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 group-hover:bg-[#D4AF37] group-hover:text-[#0A0A0A] transition-all duration-300 rounded-none">
                  {prod.isOwned ? 'Lihat Detail' : prod.ebook_id ? 'Lihat & Beli' : 'Lihat Detail'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-[#D4AF37]/10 glass-panel rounded-none">
          <ShoppingBag className="w-10 h-10 text-[#D4AF37]/20 mx-auto mb-4" />
          <p className="text-[#888888] text-sm">Produk marketplace akan segera hadir.</p>
        </div>
      ) : (
        <div className="text-center py-20 border border-[#D4AF37]/10 glass-panel rounded-none">
          <p className="text-[#888888] text-sm">Tidak ada produk yang cocok dengan pencarian.</p>
        </div>
      )}
    </div>
  )
}
