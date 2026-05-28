# Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin CRUD produk digital marketplace + toggle published, member area tampil Coming Soon.

**Architecture:** Ikuti pola `/admin/ebook` — RSC page.tsx fetch data, `MarketplaceClient` (client, tabel+aksi), `MarketplaceDialog` (modal form), `actions.ts` (server actions). Tambah `togglePublished` action untuk toggle cepat tanpa buka dialog. Member route `/marketplace` adalah halaman statis Coming Soon.

**Tech Stack:** Next.js 15 App Router, Supabase (admin client + RLS), TypeScript, Tailwind 4, Vitest + @testing-library/react

---

## File Map

| File | Action | Keterangan |
|------|--------|-----------|
| `supabase/migrations/004_marketplace.sql` | Create | DDL tabel + RLS |
| `src/types/database.ts` | Modify | Tambah tipe `marketplace_products` |
| `src/app/(admin)/admin/marketplace/actions.ts` | Create | Server actions: create, update, delete, togglePublished |
| `src/app/(admin)/admin/marketplace/page.tsx` | Create | RSC: fetch + render MarketplaceClient |
| `src/app/(admin)/admin/marketplace/MarketplaceClient.tsx` | Create | Client: tabel list, tombol aksi, toggle inline |
| `src/app/(admin)/admin/marketplace/MarketplaceDialog.tsx` | Create | Modal form add/edit |
| `src/components/admin/AdminSidebar.tsx` | Modify | Tambah nav "Marketplace" |
| `src/app/(member)/marketplace/page.tsx` | Create | Coming Soon page |
| `src/components/member/MemberSidebar.tsx` | Modify | Tambah nav "Marketplace" |
| `src/components/member/MemberBottomNav.tsx` | Modify | Tambah nav "Marketplace" |
| `src/test/components/admin/MarketplaceDialog.test.tsx` | Create | Unit tests dialog |

---

## Task 1: SQL Migration

**Files:**
- Create: `supabase/migrations/004_marketplace.sql`

- [ ] **Step 1: Buat file migration**

```sql
-- supabase/migrations/004_marketplace.sql

create table if not exists marketplace_products (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  description    text,
  category       text not null,
  price          integer not null default 0,
  original_price integer,
  cover_url      text,
  product_url    text not null,
  is_published   boolean not null default false,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table marketplace_products enable row level security;

-- Member hanya lihat produk published
create policy "members_select_published" on marketplace_products
  for select using (is_published = true);

-- Admin (service_role) full access — bypass RLS secara otomatis
```

- [ ] **Step 2: Jalankan di Supabase SQL Editor**

Buka Supabase dashboard → SQL Editor → paste konten file → Run.

---

## Task 2: TypeScript Types

**Files:**
- Modify: `src/types/database.ts`

- [ ] **Step 1: Tambah tipe `marketplace_products` setelah blok `transactions`**

Tambahkan setelah penutup `transactions: { ... }` dan sebelum `}` penutup `Tables`:

```typescript
      marketplace_products: {
        Row: {
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
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          category: string
          price?: number
          original_price?: number | null
          cover_url?: string | null
          product_url: string
          is_published?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          title?: string
          description?: string | null
          category?: string
          price?: number
          original_price?: number | null
          cover_url?: string | null
          product_url?: string
          is_published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

---

## Task 3: Server Actions

**Files:**
- Create: `src/app/(admin)/admin/marketplace/actions.ts`

- [ ] **Step 1: Buat file actions.ts**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export async function createProduct(formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const originalPrice = formData.get('original_price')
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
  })
  if (error) {
    console.error('[createProduct]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/marketplace')
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const originalPrice = formData.get('original_price')
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
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) {
    console.error('[updateProduct]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/marketplace')
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('marketplace_products').delete().eq('id', id)
  if (error) {
    console.error('[deleteProduct]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/marketplace')
}

export async function togglePublished(id: string, current: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('marketplace_products')
    .update({ is_published: !current, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) {
    console.error('[togglePublished]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/marketplace')
}
```

---

## Task 4: Admin page.tsx (RSC)

**Files:**
- Create: `src/app/(admin)/admin/marketplace/page.tsx`

- [ ] **Step 1: Buat file page.tsx**

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import { MarketplaceClient } from './MarketplaceClient'

export default async function AdminMarketplacePage() {
  const supabase = createAdminClient()
  const { data: products } = await supabase
    .from('marketplace_products')
    .select('id, slug, title, category, price, original_price, cover_url, product_url, is_published')
    .order('sort_order')

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <MarketplaceClient products={products ?? []} />
    </div>
  )
}
```

---

## Task 5: MarketplaceClient

**Files:**
- Create: `src/app/(admin)/admin/marketplace/MarketplaceClient.tsx`

- [ ] **Step 1: Buat file MarketplaceClient.tsx**

```typescript
'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { MarketplaceDialog } from './MarketplaceDialog'
import { deleteProduct, togglePublished } from './actions'

interface Product {
  id: string
  slug: string
  title: string
  category: string
  price: number
  original_price: number | null
  cover_url: string | null
  product_url: string
  is_published: boolean
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export function MarketplaceClient({ products }: { products: Product[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Product | undefined>()
  const [, startTransition] = useTransition()

  function openAdd() { setEditTarget(undefined); setDialogOpen(true) }
  function openEdit(p: Product) { setEditTarget(p); setDialogOpen(true) }

  function handleDelete(id: string) {
    if (!confirm('Hapus produk ini?')) return
    startTransition(() => deleteProduct(id))
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(() => togglePublished(id, current))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#F5F5F0]">Marketplace</h1>
        <Button variant="primary" size="sm" onClick={openAdd}>+ Tambah</Button>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1A1A1A]">
              {['Produk', 'Kategori', 'Harga', 'Status', 'Aksi'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#555555] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-[#1A1A1A] last:border-0 hover:bg-[#1A1A1A]/50 transition-colors">
                <td className="px-4 py-3 text-[#F5F5F0] font-medium">{p.title}</td>
                <td className="px-4 py-3 text-[#888888]">{p.category}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-[#F5F5F0]">{formatPrice(p.price)}</span>
                    {p.original_price && (
                      <span className="text-[#555555] text-xs line-through">{formatPrice(p.original_price)}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggle(p.id, p.is_published)}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      p.is_published
                        ? 'bg-[#D4AF37]/15 text-[#D4AF37] hover:bg-red-900/20 hover:text-red-400'
                        : 'bg-[#1A1A1A] text-[#555555] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]'
                    }`}
                    title={p.is_published ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                  >
                    {p.is_published ? 'Aktif' : 'Draft'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-xs text-[#888888] hover:text-[#D4AF37] transition-colors">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#555555]">Belum ada produk.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <MarketplaceDialog open={dialogOpen} onClose={() => setDialogOpen(false)} product={editTarget} />
    </>
  )
}
```

---

## Task 6: MarketplaceDialog

**Files:**
- Create: `src/app/(admin)/admin/marketplace/MarketplaceDialog.tsx`

- [ ] **Step 1: Buat file MarketplaceDialog.tsx**

```typescript
'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProduct, updateProduct } from './actions'

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
}

interface MarketplaceDialogProps {
  open: boolean
  onClose: () => void
  product?: Product
}

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function MarketplaceDialog({ open, onClose, product }: MarketplaceDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(product?.title ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [isPublished, setIsPublished] = useState(product?.is_published ?? false)
  const isEdit = !!product

  useEffect(() => {
    setTitle(product?.title ?? '')
    setSlug(product?.slug ?? '')
    setIsPublished(product?.is_published ?? false)
  }, [open, product])

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!isEdit) setSlug(slugify(val))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('is_published', isPublished ? 'true' : 'false')
    startTransition(async () => {
      if (isEdit) {
        await updateProduct(product.id, formData)
      } else {
        await createProduct(formData)
      }
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#F5F5F0]">
            {isEdit ? 'Edit Produk' : 'Tambah Produk'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mp_title">Nama Produk</Label>
            <Input
              id="mp_title"
              name="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mp_slug">Slug</Label>
            <Input
              id="mp_slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mp_category">Kategori</Label>
            <select
              id="mp_category"
              name="category"
              defaultValue={product?.category ?? ''}
              required
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="" disabled>Pilih kategori</option>
              <option value="Template">Template</option>
              <option value="Tools">Tools</option>
              <option value="Preset">Preset</option>
              <option value="Prompt">Prompt</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mp_description">Deskripsi</Label>
            <textarea
              id="mp_description"
              name="description"
              defaultValue={product?.description ?? ''}
              rows={2}
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-[#F5F5F0] placeholder:text-[#555555] focus:outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label htmlFor="mp_price">Harga (IDR)</Label>
              <Input
                id="mp_price"
                name="price"
                type="number"
                min={0}
                defaultValue={product?.price ?? 0}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <Label htmlFor="mp_original_price">Harga Coret (opsional)</Label>
              <Input
                id="mp_original_price"
                name="original_price"
                type="number"
                min={0}
                defaultValue={product?.original_price ?? ''}
                placeholder="Kosongkan jika tidak ada"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mp_cover_url">Cover URL (opsional)</Label>
            <Input
              id="mp_cover_url"
              name="cover_url"
              type="url"
              defaultValue={product?.cover_url ?? ''}
              placeholder="https://..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mp_product_url">Link Produk</Label>
            <Input
              id="mp_product_url"
              name="product_url"
              type="url"
              defaultValue={product?.product_url ?? ''}
              placeholder="https://drive.google.com/..."
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="mp_published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="accent-[#D4AF37] w-4 h-4"
            />
            <Label htmlFor="mp_published">Published</Label>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>Batal</Button>
            <Button type="submit" variant="primary" size="sm" loading={isPending}>
              {isEdit ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Task 7: AdminSidebar — tambah nav Marketplace

**Files:**
- Modify: `src/components/admin/AdminSidebar.tsx`

- [ ] **Step 1: Tambah "Marketplace" ke array NAV**

Ganti array NAV dari:

```typescript
const NAV = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Kursus', href: '/admin/kursus' },
  { label: 'Ebook', href: '/admin/ebook' },
  { label: 'Members', href: '/admin/members' },
]
```

Menjadi:

```typescript
const NAV = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Kursus', href: '/admin/kursus' },
  { label: 'Ebook', href: '/admin/ebook' },
  { label: 'Marketplace', href: '/admin/marketplace' },
  { label: 'Members', href: '/admin/members' },
]
```

---

## Task 8: Member Coming Soon Page

**Files:**
- Create: `src/app/(member)/marketplace/page.tsx`

- [ ] **Step 1: Buat halaman Coming Soon**

```typescript
import { ShoppingBag } from 'lucide-react'

export default function MarketplacePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mb-6">
        <ShoppingBag size={32} className="text-[#D4AF37]" />
      </div>
      <span className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-4">
        Coming Soon
      </span>
      <h1 className="text-3xl font-bold text-[#F5F5F0] mb-3">Marketplace</h1>
      <p className="text-[#888888] max-w-sm leading-relaxed">
        Segera hadir — produk digital pilihan untuk memaksimalkan profit kamu dari AI.
      </p>
    </div>
  )
}
```

---

## Task 9: MemberSidebar + MemberBottomNav

**Files:**
- Modify: `src/components/member/MemberSidebar.tsx`
- Modify: `src/components/member/MemberBottomNav.tsx`

- [ ] **Step 1: Update MemberSidebar.tsx**

Tambah import `ShoppingBag` dan nav item. Ganti baris import icons:

```typescript
import { LayoutDashboard, BookOpen, BookMarked, ShoppingBag, User } from 'lucide-react'
```

Ganti array NAV:

```typescript
const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kursus', label: 'Kursus', icon: BookOpen },
  { href: '/ebook', label: 'Ebook', icon: BookMarked },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/profile', label: 'Profil', icon: User },
]
```

- [ ] **Step 2: Update MemberBottomNav.tsx**

Tambah import `ShoppingBag` dan nav item. Ganti baris import icons:

```typescript
import { LayoutDashboard, BookOpen, BookMarked, ShoppingBag, User } from 'lucide-react'
```

Ganti array NAV:

```typescript
const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kursus', label: 'Kursus', icon: BookOpen },
  { href: '/ebook', label: 'Ebook', icon: BookMarked },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/profile', label: 'Profil', icon: User },
]
```

---

## Task 10: Unit Test MarketplaceDialog

**Files:**
- Create: `src/test/components/admin/MarketplaceDialog.test.tsx`

- [ ] **Step 1: Tulis test**

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MarketplaceDialog } from '@/app/(admin)/admin/marketplace/MarketplaceDialog'

vi.mock('@/app/(admin)/admin/marketplace/actions', () => ({
  createProduct: vi.fn().mockResolvedValue(undefined),
  updateProduct: vi.fn().mockResolvedValue(undefined),
}))

describe('MarketplaceDialog', () => {
  it('renders add form', () => {
    render(<MarketplaceDialog open={true} onClose={vi.fn()} />)
    expect(screen.getByText('Tambah Produk')).toBeInTheDocument()
  })

  it('renders edit form with prefilled data', () => {
    const product = {
      id: 'p1',
      title: 'Template Canva Pro',
      slug: 'template-canva-pro',
      description: null,
      category: 'Template',
      price: 49000,
      original_price: 99000,
      cover_url: null,
      product_url: 'https://drive.google.com/uc?export=download&id=abc123',
      is_published: true,
    }
    render(<MarketplaceDialog open={true} onClose={vi.fn()} product={product} />)
    expect(screen.getByText('Edit Produk')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Template Canva Pro')).toBeInTheDocument()
  })

  it('calls onClose on Batal', () => {
    const onClose = vi.fn()
    render(<MarketplaceDialog open={true} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /batal/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('auto-generates slug from title on add mode', () => {
    render(<MarketplaceDialog open={true} onClose={vi.fn()} />)
    const titleInput = screen.getByLabelText('Nama Produk')
    fireEvent.change(titleInput, { target: { value: 'Template AI Keren' } })
    expect(screen.getByDisplayValue('template-ai-keren')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Jalankan test**

```bash
pnpm test src/test/components/admin/MarketplaceDialog.test.tsx
```

Expected: 4 tests pass.

---

## Task 11: Verifikasi Akhir

- [ ] **Step 1: Typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 2: Test suite**

```bash
pnpm test
```

Expected: semua test pass.

- [ ] **Step 3: Build**

```bash
pnpm build
```

Expected: build sukses tanpa error.

- [ ] **Step 4: Manual smoke test**

1. Jalankan `pnpm dev`
2. Login sebagai admin → buka `/admin/marketplace`
3. Tambah produk → isi semua field → Submit → produk muncul di tabel
4. Klik badge "Draft" → berubah jadi "Aktif" (toggle inline)
5. Klik Edit → ubah harga → Simpan → perubahan tampil
6. Hapus produk → konfirmasi → produk hilang
7. Login sebagai member → buka `/marketplace` → tampil "Coming Soon"
8. Cek sidebar + bottom nav member ada item "Marketplace"
