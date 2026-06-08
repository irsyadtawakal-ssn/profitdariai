# Marketplace Product Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambahkan halaman detail produk `/marketplace/[slug]` dengan cover, deskripsi, dan poin-poin fitur produk; card di grid marketplace jadi link ke halaman ini; admin bisa input fitur produk lewat form dinamis.

**Architecture:** Tambah kolom `features JSONB` di DB, buat page `/marketplace/[slug]` yang fetch produk by slug, ekstrak `CheckoutModal` ke component tersendiri, ubah card di `MarketplaceClient` jadi link, tambah field `features` di admin dialog.

**Tech Stack:** Next.js 16 App Router, Supabase (admin client), TypeScript, Tailwind CSS, lucide-react

---

## File Map

| File | Action |
|---|---|
| `supabase/migrations/006_marketplace_features.sql` | CREATE — migrasi tambah kolom `features` |
| `src/components/member/CheckoutModal.tsx` | CREATE — ekstrak dari `MarketplaceClient.tsx` |
| `src/app/(member)/marketplace/[slug]/page.tsx` | CREATE — server page fetch produk by slug |
| `src/components/member/MarketplaceProductDetail.tsx` | CREATE — client component halaman detail |
| `src/components/member/MarketplaceClient.tsx` | MODIFY — card jadi link, hapus CheckoutModal inline |
| `src/app/(admin)/admin/marketplace/MarketplaceDialog.tsx` | MODIFY — tambah field features |
| `src/app/(admin)/admin/marketplace/actions.ts` | MODIFY — include features di insert/update |

---

## Task 1: Migration — Tambah Kolom `features`

**Files:**
- Create: `supabase/migrations/006_marketplace_features.sql`

- [ ] **Step 1: Buat file migration**

```sql
-- supabase/migrations/006_marketplace_features.sql
ALTER TABLE marketplace_products ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';
```

- [ ] **Step 2: Jalankan di Supabase SQL Editor**

Buka Supabase dashboard → SQL Editor → paste isi file → Run.
Expected: "Success. No rows returned."

- [ ] **Step 3: Verifikasi kolom ada**

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'marketplace_products' AND column_name = 'features';
```
Expected: row dengan `data_type = jsonb`, `column_default = '[]'::jsonb`

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/006_marketplace_features.sql
git commit -m "feat: add features column to marketplace_products"
```

---

## Task 2: Ekstrak CheckoutModal ke Component Tersendiri

**Files:**
- Create: `src/components/member/CheckoutModal.tsx`
- Modify: `src/components/member/MarketplaceClient.tsx`

- [ ] **Step 1: Buat file `CheckoutModal.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

export interface CheckoutProduct {
  id: string
  title: string
  price: number
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)
}

const PAYMENT_METHODS = [
  { value: 'QRIS', label: 'QRIS (Semua E-wallet)' },
  { value: 'BRIVA', label: 'BRI Virtual Account' },
  { value: 'BCAVA', label: 'BCA Virtual Account' },
  { value: 'MANDIRIVA', label: 'Mandiri Virtual Account' },
  { value: 'BNIVA', label: 'BNI Virtual Account' },
]

export function CheckoutModal({
  product,
  userEmail,
  userFullName,
  onClose,
}: {
  product: CheckoutProduct
  userEmail: string
  userFullName: string
  onClose: () => void
}) {
  const [paymentMethod, setPaymentMethod] = useState('QRIS')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBuy() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/payment/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, paymentMethod }),
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
        <div className="p-6 space-y-4">
          <div className="bg-[#111] border border-[#222] px-4 py-3 space-y-1">
            <p className="font-mono text-[9px] text-[#D4AF37] uppercase tracking-wider mb-2">Pembeli</p>
            <p className="text-sm text-[#F5F5F0] font-medium">{userFullName}</p>
            <p className="text-xs text-[#888]">{userEmail}</p>
          </div>
          <div>
            <label className="block font-mono text-[9px] text-[#D4AF37] uppercase tracking-wider mb-2">
              Metode Pembayaran
            </label>
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
          {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
        </div>
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
```

- [ ] **Step 2: Update `MarketplaceClient.tsx` — hapus CheckoutModal inline, import dari component baru, ubah card jadi link**

Ganti seluruh isi file `src/components/member/MarketplaceClient.tsx` dengan:

```tsx
'use client'

import { useState } from 'react'
import { ShoppingBag, Search, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { CheckoutModal } from './CheckoutModal'

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
  userEmail: string
  userFullName: string
}

const CATEGORIES = ['ALL', 'MATERI', 'TOOLS', 'LAINNYA']

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function MarketplaceClient({ products, userEmail, userFullName }: MarketplaceClientProps) {
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
        <CheckoutModal
          product={checkoutProduct}
          userEmail={userEmail}
          userFullName={userFullName}
          onClose={() => setCheckoutProduct(null)}
        />
      )}

      <div>
        <span className="font-mono text-[9px] text-[#D4AF37] tracking-[0.2em] block mb-2 uppercase">Etalase Digital</span>
        <h2 className="text-2xl md:text-3xl font-black text-white leading-none tracking-tight font-display">Marketplace</h2>
      </div>

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

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((prod) => (
            <Link
              key={prod.id}
              href={`/marketplace/${prod.slug}`}
              className="glass-panel group flex flex-col rounded-none overflow-hidden transition-all duration-300 border border-[#D4AF37]/15 bg-[#0E0E0E] hover:border-[#D4AF37]/40"
            >
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
                <span className="absolute top-4 right-4 bg-[#D4AF37] text-[#0A0A0A] font-mono text-[9px] font-bold px-3 py-1 uppercase tracking-wider">
                  {prod.category}
                </span>
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
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-mono text-[#D4AF37] font-bold">{formatPrice(prod.price)}</span>
                    {prod.original_price && (
                      <span className="text-[10px] font-mono text-[#888888] line-through">
                        {formatPrice(prod.original_price)}
                      </span>
                    )}
                  </div>
                </div>
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/member/CheckoutModal.tsx src/components/member/MarketplaceClient.tsx
git commit -m "feat: extract CheckoutModal, make marketplace cards link to detail page"
```

---

## Task 3: Halaman Detail Produk — Server Page

**Files:**
- Create: `src/app/(member)/marketplace/[slug]/page.tsx`

- [ ] **Step 1: Buat file page**

```tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MarketplaceProductDetail } from '@/components/member/MarketplaceProductDetail'

export default async function MarketplaceProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const adminClient = createAdminClient()
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [productRes, ownedRes, profileRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (adminClient as any)
      .from('marketplace_products')
      .select('id, slug, title, description, category, price, original_price, cover_url, product_url, ebook_id, features')
      .eq('slug', slug)
      .eq('is_published', true)
      .single(),
    user
      ? supabase.from('user_ebooks').select('ebook_id').eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from('profiles').select('email, full_name').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  if (!productRes.data) notFound()

  const product = productRes.data
  const ownedEbookIds = new Set((ownedRes.data ?? []).map((r: { ebook_id: string }) => r.ebook_id))
  const isOwned = product.ebook_id ? ownedEbookIds.has(product.ebook_id) : false
  const profile = profileRes.data

  return (
    <MarketplaceProductDetail
      product={{ ...product, isOwned, features: product.features ?? [] }}
      userEmail={profile?.email ?? user?.email ?? ''}
      userFullName={profile?.full_name ?? ''}
    />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(member)/marketplace/[slug]/page.tsx
git commit -m "feat: add marketplace product detail server page"
```

---

## Task 4: Client Component Halaman Detail

**Files:**
- Create: `src/components/member/MarketplaceProductDetail.tsx`

- [ ] **Step 1: Buat file component**

```tsx
'use client'

import { useState } from 'react'
import { ShoppingBag, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CheckoutModal } from './CheckoutModal'

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
  const [showCheckout, setShowCheckout] = useState(false)

  return (
    <div className="p-6 max-w-2xl mx-auto pt-8 pb-16 space-y-8">
      {showCheckout && (
        <CheckoutModal
          product={product}
          userEmail={userEmail}
          userFullName={userFullName}
          onClose={() => setShowCheckout(false)}
        />
      )}

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
          <button
            onClick={() => setShowCheckout(true)}
            className="w-full bg-[#D4AF37] text-[#0A0A0A] py-4 text-[11px] font-mono font-bold tracking-wider uppercase hover:bg-[#D4AF37]/90 transition-all duration-300 flex items-center justify-center gap-2 rounded-none shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          >
            Beli Sekarang — {formatPrice(product.price)}
          </button>
        ) : (
          <span className="w-full text-center text-[#555] py-4 text-[11px] font-mono uppercase tracking-wider border border-[#333] rounded-none block">
            Segera Hadir
          </span>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/member/MarketplaceProductDetail.tsx
git commit -m "feat: add MarketplaceProductDetail client component"
```

---

## Task 5: Admin Form — Tambah Field `features`

**Files:**
- Modify: `src/app/(admin)/admin/marketplace/MarketplaceDialog.tsx`
- Modify: `src/app/(admin)/admin/marketplace/actions.ts`

- [ ] **Step 1: Update `actions.ts` — include `features` di insert dan update**

Di `createProduct`, tambah `features` setelah baris `ebook_id`:

```ts
features: JSON.parse((formData.get('features') as string) || '[]'),
```

Di `updateProduct`, tambah `features` di dalam object `.update({...})` setelah `ebook_id`:

```ts
features: JSON.parse((formData.get('features') as string) || '[]'),
```

Hasil `createProduct` setelah diubah:
```ts
const { error } = await supabase.from('marketplace_products').insert({
  title: formData.get('title') as string,
  slug: formData.get('slug') as string,
  description: (formData.get('description') as string) || null,
  category: formData.get('category') as string,
  price: Number(formData.get('price') ?? 0),
  original_price: originalPrice ? Number(originalPrice) : null,
  cover_url: (formData.get('cover_url') as string) || null,
  product_url: formData.get('product_url') as string,
  is_published: formData.get('is_published') === 'true',
  ebook_id: ebookId || null,
  features: JSON.parse((formData.get('features') as string) || '[]'),
})
```

Hasil `updateProduct` setelah diubah:
```ts
const { error } = await supabase
  .from('marketplace_products')
  .update({
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    category: formData.get('category') as string,
    price: Number(formData.get('price') ?? 0),
    original_price: originalPrice ? Number(originalPrice) : null,
    cover_url: (formData.get('cover_url') as string) || null,
    product_url: formData.get('product_url') as string,
    is_published: formData.get('is_published') === 'true',
    ebook_id: ebookId || null,
    features: JSON.parse((formData.get('features') as string) || '[]'),
    updated_at: new Date().toISOString(),
  })
  .eq('id', id)
```

- [ ] **Step 2: Update `MarketplaceDialog.tsx` — tambah interface `features` dan field dinamis**

Tambah `features` ke interface `Product`:
```ts
interface Product {
  id: string
  slug: string
  title: string
  description: string | null
  category: string
  price: number
  original_price: number | null
  cover_url: string | null
  product_url: string
  is_published: boolean
  ebook_id: string | null
  features: string[]   // tambah ini
}
```

Tambah state `features` di dalam `MarketplaceDialog`:
```ts
const [features, setFeatures] = useState<string[]>(product?.features ?? [])
```

Tambah `features` ke `useEffect` reset:
```ts
useEffect(() => {
  setTitle(product?.title ?? '')
  setSlug(product?.slug ?? '')
  setIsPublished(product?.is_published ?? false)
  setEbookId(product?.ebook_id ?? '')
  setFeatures(product?.features ?? [])   // tambah ini
}, [open, product])
```

Tambah `features` ke `handleSubmit` sebelum `startTransition`:
```ts
formData.set('features', JSON.stringify(features))
```

Tambah UI field `features` di dalam `<form>`, setelah field `description` dan sebelum field harga:

```tsx
<div className="flex flex-col gap-1.5">
  <Label>Poin-poin Produk</Label>
  <div className="flex flex-col gap-2">
    {features.map((feat, i) => (
      <div key={i} className="flex gap-2">
        <input
          type="text"
          value={feat}
          onChange={(e) => {
            const next = [...features]
            next[i] = e.target.value
            setFeatures(next)
          }}
          placeholder={`Contoh: 10 dokumen PDF`}
          className="flex-1 bg-[#0A0A0A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-[#F5F5F0] placeholder:text-[#555555] focus:outline-none focus:border-[#D4AF37]"
        />
        <button
          type="button"
          onClick={() => setFeatures(features.filter((_, j) => j !== i))}
          className="text-[#555] hover:text-red-400 transition-colors px-2 text-lg leading-none"
        >
          ×
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={() => setFeatures([...features, ''])}
      className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider border border-[#D4AF37]/30 py-2 hover:bg-[#D4AF37]/10 transition-colors rounded-none"
    >
      + Tambah Poin
    </button>
  </div>
</div>
```

- [ ] **Step 3: Update admin page — pastikan `features` ikut di-fetch**

Cek `src/app/(admin)/admin/marketplace/page.tsx`, pastikan query `select()` include `features`:
```ts
.select('id, slug, title, description, category, price, original_price, cover_url, product_url, is_published, ebook_id, features')
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(admin)/admin/marketplace/actions.ts src/app/(admin)/admin/marketplace/MarketplaceDialog.tsx src/app/(admin)/admin/marketplace/page.tsx
git commit -m "feat: add features field to admin marketplace form"
```

---

## Task 6: Verifikasi End-to-End

- [ ] **Step 1: Jalankan dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Test alur lengkap**

1. Buka `http://localhost:3000/marketplace`
2. Klik salah satu card → harus navigate ke `/marketplace/[slug]`
3. Pastikan cover, judul, harga, deskripsi, dan poin features tampil
4. Klik "Beli Sekarang" → checkout modal muncul
5. Buka `http://localhost:3000/admin/marketplace`
6. Edit salah satu produk → tambah beberapa poin di "Poin-poin Produk" → simpan
7. Kembali ke halaman detail → poin baru tampil

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```
Expected: no errors

- [ ] **Step 4: Lint**

```bash
pnpm lint
```
Expected: no errors
