# Admin Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memberi admin kemampuan membuat landing page dengan paste HTML standalone, disimpan di DB dan disajikan di route publik `/lp/{slug}`.

**Architecture:** Tabel Supabase `landing_pages` menyimpan HTML mentah. Route Handler `/lp/[slug]/route.ts` men-serve HTML apa adanya (bypass React tree). CRUD admin mengikuti pola existing (`page.tsx` + `actions.ts` + `Client.tsx` + `Dialog.tsx`) yang dipakai marketplace/materi.

**Tech Stack:** Next.js 16 (App Router) + Supabase + TypeScript + Vitest (test) + shadcn/ui (Dialog/Input/Button/Label).

---

## File Structure

- Create: `supabase/migrations/20260613_landing_pages.sql` — tabel + RLS
- Create: `src/app/(marketing)/lp/[slug]/route.ts` — route handler publik (serve raw HTML)
- Create: `src/app/(admin)/admin/landing/page.tsx` — list landing pages (server component)
- Create: `src/app/(admin)/admin/landing/actions.ts` — server actions CRUD (requireAdmin)
- Create: `src/app/(admin)/admin/landing/LandingClient.tsx` — tabel + tombol (client)
- Create: `src/app/(admin)/admin/landing/LandingDialog.tsx` — form paste HTML (client)
- Create: `src/lib/landing/slug.ts` — `slugify` + `isValidSlug` (shared, tested)
- Create: `src/test/lib/landing/slug.test.ts` — unit test slug helper
- Create: `src/test/components/admin/LandingDialog.test.tsx` — test dialog
- Modify: `src/components/admin/AdminSidebar.tsx` — tambah menu "Landing Pages"

---

### Task 1: Migration tabel `landing_pages`

**Files:**
- Create: `supabase/migrations/20260613_landing_pages.sql`

- [ ] **Step 1: Tulis migration SQL**

```sql
-- supabase/migrations/20260613_landing_pages.sql

create table if not exists landing_pages (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  html        text not null,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table landing_pages enable row level security;

-- Read publik hanya untuk landing yang published
create policy "public_select_published" on landing_pages
  for select using (published = true);

-- Admin pakai service_role (createAdminClient) yang bypass RLS, jadi
-- tidak perlu policy write tambahan. requireAdmin() menjaga di layer action.

create index if not exists landing_pages_slug_idx on landing_pages (slug);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260613_landing_pages.sql
git commit -m "feat: migration tabel landing_pages"
```

> Catatan: migration dijalankan manual di Supabase SQL editor (sesuai CLAUDE.md). Tidak ada test otomatis untuk SQL.

---

### Task 2: Helper slug (`slugify` + `isValidSlug`)

**Files:**
- Create: `src/lib/landing/slug.ts`
- Test: `src/test/lib/landing/slug.test.ts`

- [ ] **Step 1: Tulis failing test**

```typescript
// src/test/lib/landing/slug.test.ts
import { describe, it, expect } from 'vitest'
import { slugify, isValidSlug } from '@/lib/landing/slug'

describe('slugify', () => {
  it('mengubah teks jadi slug huruf kecil berstrip', () => {
    expect(slugify('Cuan Dari AI')).toBe('cuan-dari-ai')
  })
  it('membuang karakter non-alfanumerik', () => {
    expect(slugify('Promo!! 2026 #spesial')).toBe('promo-2026-spesial')
  })
  it('tidak menghasilkan strip ganda atau strip di ujung', () => {
    expect(slugify('  --Halo   Dunia--  ')).toBe('halo-dunia')
  })
})

describe('isValidSlug', () => {
  it('menerima slug valid', () => {
    expect(isValidSlug('cuan-dari-ai')).toBe(true)
    expect(isValidSlug('promo2026')).toBe(true)
  })
  it('menolak slug invalid', () => {
    expect(isValidSlug('Cuan Dari AI')).toBe(false)
    expect(isValidSlug('-leading')).toBe(false)
    expect(isValidSlug('trailing-')).toBe(false)
    expect(isValidSlug('double--strip')).toBe(false)
    expect(isValidSlug('')).toBe(false)
  })
})
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `pnpm vitest run src/test/lib/landing/slug.test.ts`
Expected: FAIL — `Cannot find module '@/lib/landing/slug'`

- [ ] **Step 3: Implementasi helper**

```typescript
// src/lib/landing/slug.ts
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug)
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `pnpm vitest run src/test/lib/landing/slug.test.ts`
Expected: PASS (semua case)

- [ ] **Step 5: Commit**

```bash
git add src/lib/landing/slug.ts src/test/lib/landing/slug.test.ts
git commit -m "feat: helper slugify + isValidSlug untuk landing pages"
```

---

### Task 3: Server actions CRUD

**Files:**
- Create: `src/app/(admin)/admin/landing/actions.ts`

- [ ] **Step 1: Implementasi actions**

```typescript
// src/app/(admin)/admin/landing/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { isValidSlug } from '@/lib/landing/slug'

function readFields(formData: FormData) {
  const title = ((formData.get('title') as string) || '').trim()
  const slug = ((formData.get('slug') as string) || '').trim()
  const html = (formData.get('html') as string) || ''
  const published = formData.get('published') === 'true'
  if (!title) throw new Error('Judul wajib diisi.')
  if (!isValidSlug(slug)) throw new Error('Slug tidak valid. Gunakan huruf kecil, angka, dan strip (contoh: cuan-dari-ai).')
  if (!html.trim()) throw new Error('Kode HTML wajib diisi.')
  return { title, slug, html, published }
}

export async function createLandingPage(formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const fields = readFields(formData)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('landing_pages').insert(fields)
  if (error) {
    console.error('[createLandingPage]', error.message)
    throw new Error(error.code === '23505' ? 'Slug sudah dipakai landing page lain.' : error.message)
  }
  revalidatePath('/admin/landing')
}

export async function updateLandingPage(id: string, formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const fields = readFields(formData)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('landing_pages')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) {
    console.error('[updateLandingPage]', error.message)
    throw new Error(error.code === '23505' ? 'Slug sudah dipakai landing page lain.' : error.message)
  }
  revalidatePath('/admin/landing')
  revalidatePath(`/lp/${fields.slug}`)
}

export async function deleteLandingPage(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('landing_pages').delete().eq('id', id)
  if (error) {
    console.error('[deleteLandingPage]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/landing')
}

export async function togglePublish(id: string, current: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('landing_pages')
    .update({ published: !current, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) {
    console.error('[togglePublish]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/landing')
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (tanpa error di file ini)

- [ ] **Step 3: Commit**

```bash
git add "src/app/(admin)/admin/landing/actions.ts"
git commit -m "feat: server actions CRUD landing pages"
```

---

### Task 4: Dialog form (paste HTML)

**Files:**
- Create: `src/app/(admin)/admin/landing/LandingDialog.tsx`
- Test: `src/test/components/admin/LandingDialog.test.tsx`

- [ ] **Step 1: Tulis failing test**

```tsx
// src/test/components/admin/LandingDialog.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LandingDialog } from '@/app/(admin)/admin/landing/LandingDialog'

vi.mock('@/app/(admin)/admin/landing/actions', () => ({
  createLandingPage: vi.fn(),
  updateLandingPage: vi.fn(),
}))

describe('LandingDialog', () => {
  it('auto-generate slug dari judul saat mode tambah', () => {
    render(<LandingDialog open onClose={() => {}} />)
    const title = screen.getByLabelText('Judul') as HTMLInputElement
    fireEvent.change(title, { target: { value: 'Cuan Dari AI' } })
    const slug = screen.getByLabelText('Slug') as HTMLInputElement
    expect(slug.value).toBe('cuan-dari-ai')
  })

  it('menampilkan nilai awal saat mode edit', () => {
    render(
      <LandingDialog
        open
        onClose={() => {}}
        landing={{ id: '1', slug: 'promo', title: 'Promo', html: '<h1>Hi</h1>', published: true }}
      />,
    )
    expect((screen.getByLabelText('Slug') as HTMLInputElement).value).toBe('promo')
    expect((screen.getByLabelText('Kode HTML') as HTMLTextAreaElement).value).toBe('<h1>Hi</h1>')
  })
})
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `pnpm vitest run src/test/components/admin/LandingDialog.test.tsx`
Expected: FAIL — module `LandingDialog` belum ada

- [ ] **Step 3: Implementasi dialog**

```tsx
// src/app/(admin)/admin/landing/LandingDialog.tsx
'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { slugify } from '@/lib/landing/slug'
import { createLandingPage, updateLandingPage } from './actions'

export interface LandingPage {
  id: string
  slug: string
  title: string
  html: string
  published: boolean
}

interface LandingDialogProps {
  open: boolean
  onClose: () => void
  landing?: LandingPage
}

export function LandingDialog({ open, onClose, landing }: LandingDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(landing?.title ?? '')
  const [slug, setSlug] = useState(landing?.slug ?? '')
  const [html, setHtml] = useState(landing?.html ?? '')
  const [published, setPublished] = useState(landing?.published ?? false)
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!landing

  useEffect(() => {
    setTitle(landing?.title ?? '')
    setSlug(landing?.slug ?? '')
    setHtml(landing?.html ?? '')
    setPublished(landing?.published ?? false)
    setError(null)
  }, [open, landing])

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!isEdit) setSlug(slugify(val))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData()
    formData.set('title', title)
    formData.set('slug', slug)
    formData.set('html', html)
    formData.set('published', published ? 'true' : 'false')
    startTransition(async () => {
      try {
        if (isEdit) await updateLandingPage(landing!.id, formData)
        else await createLandingPage(formData)
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menyimpan.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Landing Page' : 'Tambah Landing Page'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Judul</Label>
            <Input id="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            <p className="text-xs text-gray-400 mt-1">URL: /lp/{slug || 'slug'}</p>
          </div>
          <div>
            <Label htmlFor="html">Kode HTML</Label>
            <textarea
              id="html"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              required
              rows={12}
              className="w-full rounded border border-gray-600 bg-transparent p-2 font-mono text-xs"
              placeholder="Tempel HTML lengkap di sini..."
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Publish (tampil di /lp/{slug || 'slug'})
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `pnpm vitest run src/test/components/admin/LandingDialog.test.tsx`
Expected: PASS

> Jika `Button` belum punya `variant="ghost"`, gunakan `variant="secondary"` atau cek varian yang tersedia di `src/components/ui/button.tsx` sebelum step ini.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(admin)/admin/landing/LandingDialog.tsx" src/test/components/admin/LandingDialog.test.tsx
git commit -m "feat: LandingDialog form paste HTML"
```

---

### Task 5: Client list + page

**Files:**
- Create: `src/app/(admin)/admin/landing/LandingClient.tsx`
- Create: `src/app/(admin)/admin/landing/page.tsx`

- [ ] **Step 1: Implementasi LandingClient**

```tsx
// src/app/(admin)/admin/landing/LandingClient.tsx
'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { LandingDialog, type LandingPage } from './LandingDialog'
import { deleteLandingPage, togglePublish } from './actions'

export function LandingClient({ pages }: { pages: LandingPage[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<LandingPage | undefined>()
  const [, startTransition] = useTransition()

  function openAdd() { setEditTarget(undefined); setDialogOpen(true) }
  function openEdit(p: LandingPage) { setEditTarget(p); setDialogOpen(true) }

  function handleDelete(id: string) {
    if (!confirm('Hapus landing page ini?')) return
    startTransition(() => deleteLandingPage(id))
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(() => togglePublish(id, current))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#F5F5F0]">Landing Pages</h1>
        <Button variant="primary" size="sm" onClick={openAdd}>+ Tambah</Button>
      </div>

      <div className="space-y-2">
        {pages.length === 0 && <p className="text-gray-400">Belum ada landing page.</p>}
        {pages.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded border border-gray-700 p-3">
            <div>
              <p className="font-semibold text-[#F5F5F0]">{p.title}</p>
              <a href={`/lp/${p.slug}`} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:underline">
                /lp/{p.slug} {p.published ? '· Live' : '· Draft'}
              </a>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleToggle(p.id, p.published)}>
                {p.published ? 'Unpublish' : 'Publish'}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => openEdit(p)}>Edit</Button>
              <Button variant="secondary" size="sm" onClick={() => handleDelete(p.id)}>Hapus</Button>
            </div>
          </div>
        ))}
      </div>

      <LandingDialog open={dialogOpen} onClose={() => setDialogOpen(false)} landing={editTarget} />
    </>
  )
}
```

- [ ] **Step 2: Implementasi page**

```tsx
// src/app/(admin)/admin/landing/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { LandingClient } from './LandingClient'

export default async function AdminLandingPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data: pages } = await supabase
    .from('landing_pages')
    .select('id, slug, title, html, published')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <LandingClient pages={pages ?? []} />
    </div>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add "src/app/(admin)/admin/landing/LandingClient.tsx" "src/app/(admin)/admin/landing/page.tsx"
git commit -m "feat: halaman list admin landing pages"
```

---

### Task 6: Route publik `/lp/[slug]`

**Files:**
- Create: `src/app/(marketing)/lp/[slug]/route.ts`

- [ ] **Step 1: Implementasi route handler**

```typescript
// src/app/(marketing)/lp/[slug]/route.ts
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('landing_pages')
    .select('html, published')
    .eq('slug', slug)
    .maybeSingle()

  if (!data || !data.published) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(data.html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}
```

> `createServerClient` adalah anon client → RLS policy `public_select_published` membatasi ke baris published. `maybeSingle()` aman saat slug tidak ada. Route Handler tidak memakai layout `(marketing)` jadi HTML disajikan murni tanpa chrome.

- [ ] **Step 2: Typecheck + build**

Run: `pnpm typecheck && pnpm build`
Expected: PASS, route `/lp/[slug]` muncul di output build.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(marketing)/lp/[slug]/route.ts"
git commit -m "feat: route publik /lp/[slug] serve raw HTML"
```

---

### Task 7: Menu sidebar

**Files:**
- Modify: `src/components/admin/AdminSidebar.tsx`

- [ ] **Step 1: Tambah item NAV**

Cari array `NAV` (sekitar baris 9-13). Tambah entri setelah Marketplace. Pastikan icon di-import (gunakan `FileText` dari `lucide-react`):

```tsx
// di blok import lucide-react, tambahkan FileText
// lalu di array NAV setelah baris Marketplace:
  { label: 'Landing Pages', href: '/admin/landing', icon: FileText },
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AdminSidebar.tsx
git commit -m "feat: menu Landing Pages di admin sidebar"
```

---

### Task 8: Verifikasi end-to-end

- [ ] **Step 1: Jalankan migration**

Jalankan isi `supabase/migrations/20260613_landing_pages.sql` di Supabase SQL editor.

- [ ] **Step 2: Full test suite**

Run: `pnpm vitest run && pnpm typecheck`
Expected: semua test PASS, no type error.

- [ ] **Step 3: Manual smoke test (dev)**

Run: `pnpm dev`
- Buka `/admin/landing` → klik "+ Tambah" → paste HTML contoh → slug `cuan-dari-ai` → publish → simpan.
- Buka `/lp/cuan-dari-ai` → halaman tampil identik HTML asli (fonts, style, script jalan).
- Unpublish → buka `/lp/cuan-dari-ai` → 404.
- Buka `/lp/slug-ngawur` → 404.

- [ ] **Step 4: Commit catatan (jika ada perubahan)**

Tidak ada commit jika hanya verifikasi.

---

## Self-Review

**Spec coverage:**
- DB `landing_pages` + RLS → Task 1 ✓
- Route publik raw HTML → Task 6 ✓
- Admin CRUD (page/actions/client/dialog) → Task 3,4,5 ✓
- Sidebar → Task 7 ✓
- Validasi slug (regex, unik) → Task 2 (helper) + Task 3 (cek + 23505) ✓
- Validasi HTML/title non-kosong → Task 3 ✓
- Workflow admin → Task 8 smoke test ✓

**Placeholder scan:** Tidak ada TBD/TODO; semua step berisi kode aktual.

**Type consistency:** `LandingPage` interface didefinisikan di `LandingDialog.tsx` (Task 4) dan di-reuse di `LandingClient.tsx` (Task 5). Action `togglePublish(id, current)`, `deleteLandingPage(id)`, `createLandingPage(formData)`, `updateLandingPage(id, formData)` konsisten antara `actions.ts` (Task 3) dan pemanggil (Task 4,5). `slugify`/`isValidSlug` konsisten Task 2 → 3,4.
