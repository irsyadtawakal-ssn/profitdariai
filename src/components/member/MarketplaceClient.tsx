'use client'

import { useState } from 'react'
import { ShoppingBag, Search, CheckCircle, X, Loader2 } from 'lucide-react'
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

const CATEGORIES = ['ALL', 'E-BOOKS', 'ONLINE CLASSES', 'BUNDLES']

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)
}

// ── Checkout Modal ──────────────────────────────────────────────────────────
function CheckoutModal({
  product,
  onClose,
}: {
  product: MarketplaceProduct
  onClose: () => void
}) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('QRIS')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const PAYMENT_METHODS = [
    { value: 'QRIS', label: 'QRIS (Semua E-wallet)' },
    { value: 'BRIVA', label: 'BRI Virtual Account' },
    { value: 'BCAVA', label: 'BCA Virtual Account' },
    { value: 'MANDIRIVA', label: 'Mandiri Virtual Account' },
    { value: 'BNIVA', label: 'BNI Virtual Account' },
  ]

  async function handleBuy() {
    setError(null)
    if (!fullName.trim() || !email.trim()) {
      setError('Nama dan email wajib diisi.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/payment/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          paymentMethod,
          email: email.trim(),
          fullName: fullName.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal membuat transaksi.')
        return
      }
      window.location.href = data.checkout_url
    } catch {
      setError('Tidak dapat terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0E0E0E] border border-[#D4AF37]/30 w-full max-w-md rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#222]">
          <div>
            <p className="font-mono text-[9px] text-[#D4AF37] uppercase tracking-widest mb-1">Checkout</p>
            <h3 className="font-display text-white font-bold text-sm">{product.title}</h3>
            <p className="text-[#D4AF37] font-mono text-xs font-bold">{formatPrice(product.price)}</p>
          </div>
          <button onClick={onClose} className="text-[#888888] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block font-mono text-[9px] text-[#D4AF37] uppercase tracking-wider mb-2">Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama kamu"
              className="w-full bg-[#111] border border-[#333] focus:border-[#D4AF37] px-4 py-3 text-sm text-[#F5F5F0] placeholder-[#555] outline-none transition-all rounded-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[9px] text-[#D4AF37] uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@kamu.com"
              className="w-full bg-[#111] border border-[#333] focus:border-[#D4AF37] px-4 py-3 text-sm text-[#F5F5F0] placeholder-[#555] outline-none transition-all rounded-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[9px] text-[#D4AF37] uppercase tracking-wider mb-2">Metode Pembayaran</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-[#111] border border-[#333] focus:border-[#D4AF37] px-4 py-3 text-sm text-[#F5F5F0] outline-none transition-all rounded-none"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-red-400 text-xs font-mono">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#222] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-[#333] text-[#888] py-3 text-[10px] font-mono uppercase tracking-wider hover:text-white transition-colors rounded-none"
          >
            Batal
          </button>
          <button
            onClick={handleBuy}
            disabled={loading}
            className="flex-1 bg-[#D4AF37] text-[#0A0A0A] py-3 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-[#D4AF37]/90 transition-all disabled:opacity-50 rounded-none flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {loading ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function MarketplaceClient({ products }: MarketplaceClientProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')
  const [checkoutProduct, setCheckoutProduct] = useState<MarketplaceProduct | null>(null)

  const filtered = products.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'ALL' || p.category.toUpperCase() === category
    return matchSearch && matchCat
  })

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pt-8 pb-16">
      {checkoutProduct && (
        <CheckoutModal product={checkoutProduct} onClose={() => setCheckoutProduct(null)} />
      )}
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
            <div
              key={prod.id}
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

                {/* CTA Button */}
                {prod.isOwned ? (
                  <Link
                    href="/materi"
                    className="w-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] py-3 text-[10px] font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 rounded-none"
                  >
                    <CheckCircle size={14} />
                    Buka di Library
                  </Link>
                ) : prod.ebook_id ? (
                  <button
                    onClick={() => setCheckoutProduct(prod)}
                    className="w-full border border-[#D4AF37]/40 text-[#D4AF37] py-3 text-[10px] font-mono font-bold tracking-wider uppercase hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all duration-300 flex items-center justify-center gap-2 active:scale-98 rounded-none hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                  >
                    Beli Sekarang
                  </button>
                ) : (
                  <span className="w-full text-center text-[#555] py-3 text-[10px] font-mono uppercase tracking-wider border border-[#333] rounded-none block">
                    Segera Hadir
                  </span>
                )}
              </div>
            </div>
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
