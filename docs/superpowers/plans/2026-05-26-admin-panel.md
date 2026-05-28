# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lengkapi admin panel dengan dashboard metrics, member list, dan CRUD kursus (+ modul) dan ebook.

**Architecture:** Server Components untuk data fetching, Server Actions untuk mutations, Dialog (shadcn/ui) untuk form CRUD. Upload PDF ebook dilakukan client-side ke Supabase Storage, lalu `file_path` disimpan via Server Action. Modul kursus dikelola di halaman tersendiri `/admin/kursus/[id]/modul`.

**Tech Stack:** Next.js 15 App Router, Supabase (server + admin client), Server Actions, `revalidatePath`, shadcn/ui Dialog, Tailwind, `useTransition`, Vitest + @testing-library/react.

---

## File Map

**Dibuat baru:**
- `src/components/admin/AdminSidebar.tsx` — sidebar nav (Dashboard, Kursus, Ebook, Members)
- `src/app/(admin)/admin/kursus/page.tsx` — list kursus + trigger dialog
- `src/app/(admin)/admin/kursus/KursusClient.tsx` — client component, kelola state dialog
- `src/app/(admin)/admin/kursus/KursusDialog.tsx` — form dialog add/edit kursus
- `src/app/(admin)/admin/kursus/actions.ts` — Server Actions kursus (create, update, delete)
- `src/app/(admin)/admin/kursus/[id]/modul/page.tsx` — list modul + trigger dialog
- `src/app/(admin)/admin/kursus/[id]/modul/ModulClient.tsx` — client, state dialog modul
- `src/app/(admin)/admin/kursus/[id]/modul/ModulDialog.tsx` — form dialog add/edit modul
- `src/app/(admin)/admin/kursus/[id]/modul/actions.ts` — Server Actions modul
- `src/app/(admin)/admin/ebook/page.tsx` — list ebook + trigger dialog
- `src/app/(admin)/admin/ebook/EbookClient.tsx` — client, state dialog
- `src/app/(admin)/admin/ebook/EbookDialog.tsx` — form dialog add/edit ebook + upload PDF
- `src/app/(admin)/admin/ebook/actions.ts` — Server Actions ebook
- `src/app/(admin)/admin/members/page.tsx` — member list + search + filter
- `src/test/components/admin/KursusDialog.test.tsx`
- `src/test/components/admin/ModulDialog.test.tsx`
- `src/test/components/admin/EbookDialog.test.tsx`

**Dimodifikasi:**
- `src/app/(admin)/layout.tsx` — tambah AdminSidebar + flex layout
- `src/app/(admin)/admin/dashboard/page.tsx` — rewrite dengan metrics nyata

---

## Task 1: AdminSidebar + Layout

**Files:**
- Create: `src/components/admin/AdminSidebar.tsx`
- Modify: `src/app/(admin)/layout.tsx`

- [ ] **Step 1: Buat AdminSidebar**

```tsx
// src/components/admin/AdminSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Kursus', href: '/admin/kursus' },
  { label: 'Ebook', href: '/admin/ebook' },
  { label: 'Members', href: '/admin/members' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-52 flex-shrink-0 border-r border-[#1A1A1A] min-h-screen p-4">
      <div className="text-[#D4AF37] font-bold text-sm mb-6 px-2 tracking-widest">ADMIN</div>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname.startsWith(href)
                ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-medium'
                : 'text-[#888888] hover:text-[#F5F5F0] hover:bg-[#1A1A1A]'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Update AdminLayout**

```tsx
// src/app/(admin)/layout.tsx
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Commit**
```bash
git add src/components/admin/AdminSidebar.tsx src/app/\(admin\)/layout.tsx
git commit -m "feat: admin sidebar + flex layout"
```

---

## Task 2: Dashboard Metrics

**Files:**
- Modify: `src/app/(admin)/admin/dashboard/page.tsx`

- [ ] **Step 1: Rewrite dashboard page dengan metrics nyata**

```tsx
// src/app/(admin)/admin/dashboard/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { id } from 'date-fns/locale'

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()
  const now = new Date()

  const [
    { count: totalMembers },
    { count: activeMembers },
    { data: mrrData },
    { count: totalCourses },
    { count: totalEbooks },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'member'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'member')
      .gt('membership_expires_at', now.toISOString()),
    supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'PAID')
      .gte('paid_at', startOfMonth(now).toISOString())
      .lte('paid_at', endOfMonth(now).toISOString()),
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('ebooks').select('*', { count: 'exact', head: true }).eq('is_published', true),
  ])

  const mrr = mrrData?.reduce((sum, tx) => sum + tx.amount, 0) ?? 0
  const mrrFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(mrr)

  const stats = [
    { label: 'Total Member', value: totalMembers ?? 0 },
    { label: 'Member Aktif', value: activeMembers ?? 0 },
    { label: `Revenue ${format(now, 'MMM yyyy', { locale: id })}`, value: mrrFormatted },
    { label: 'Kursus Aktif', value: totalCourses ?? 0 },
    { label: 'Ebook Aktif', value: totalEbooks ?? 0 },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#F5F5F0] mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-[#111111] border border-[#222222] rounded-xl p-5">
            <div className="text-2xl font-bold text-[#D4AF37] mb-1">{value}</div>
            <div className="text-[#888888] text-sm">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/\(admin\)/admin/dashboard/page.tsx
git commit -m "feat: admin dashboard metrics (members, revenue, content count)"
```

---

## Task 3: Member List

**Files:**
- Create: `src/app/(admin)/admin/members/page.tsx`

- [ ] **Step 1: Buat members page**

```tsx
// src/app/(admin)/admin/members/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface MembersPageProps {
  searchParams: Promise<{ q?: string; status?: string }>
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const { q, status } = await searchParams
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  let query = supabase
    .from('profiles')
    .select('id, full_name, email, membership_expires_at, created_at')
    .eq('role', 'member')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
  }
  if (status === 'active') {
    query = query.gt('membership_expires_at', now)
  } else if (status === 'expired') {
    query = query.or(`membership_expires_at.is.null,membership_expires_at.lt.${now}`)
  }

  const { data: members } = await query.limit(100)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#F5F5F0] mb-6">Members</h1>

      <form className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari nama atau email..."
          className="flex-1 bg-[#111111] border border-[#222222] rounded-lg px-4 py-2 text-[#F5F5F0] text-sm placeholder:text-[#555555] focus:outline-none focus:border-[#D4AF37]"
        />
        <select
          name="status"
          defaultValue={status ?? ''}
          className="bg-[#111111] border border-[#222222] rounded-lg px-3 py-2 text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="">Semua</option>
          <option value="active">Aktif</option>
          <option value="expired">Expired</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-[#D4AF37] text-[#0A0A0A] text-sm font-semibold rounded-lg hover:bg-[#D4AF37]/90 transition-colors"
        >
          Cari
        </button>
      </form>

      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1A1A1A]">
              {['Nama', 'Email', 'Status', 'Expires', 'Join'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#555555] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members?.map((m) => {
              const isActive = !!m.membership_expires_at && new Date(m.membership_expires_at) > new Date()
              return (
                <tr key={m.id} className="border-b border-[#1A1A1A] last:border-0 hover:bg-[#1A1A1A]/50 transition-colors">
                  <td className="px-4 py-3 text-[#F5F5F0]">{m.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-[#888888]">{m.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      isActive ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'bg-red-900/20 text-red-400'
                    }`}>
                      {isActive ? 'Aktif' : 'Expired'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#888888]">
                    {m.membership_expires_at
                      ? format(new Date(m.membership_expires_at), 'd MMM yyyy', { locale: id })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-[#888888]">
                    {format(new Date(m.created_at), 'd MMM yyyy', { locale: id })}
                  </td>
                </tr>
              )
            })}
            {(!members || members.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#555555]">
                  Tidak ada member ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/\(admin\)/admin/members/page.tsx
git commit -m "feat: admin member list with search and status filter"
```

---

## Task 4: CRUD Kursus — Server Actions

**Files:**
- Create: `src/app/(admin)/admin/kursus/actions.ts`

- [ ] **Step 1: Buat server actions kursus**

```ts
// src/app/(admin)/admin/kursus/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createKursus(formData: FormData) {
  const supabase = createAdminClient()
  await supabase.from('courses').insert({
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    category: formData.get('category') as string,
    thumbnail_url: (formData.get('thumbnail_url') as string) || null,
    is_published: formData.get('is_published') === 'true',
  })
  revalidatePath('/admin/kursus')
}

export async function updateKursus(id: string, formData: FormData) {
  const supabase = createAdminClient()
  await supabase
    .from('courses')
    .update({
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      description: (formData.get('description') as string) || null,
      category: formData.get('category') as string,
      thumbnail_url: (formData.get('thumbnail_url') as string) || null,
      is_published: formData.get('is_published') === 'true',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  revalidatePath('/admin/kursus')
}

export async function deleteKursus(id: string) {
  const supabase = createAdminClient()
  await supabase.from('courses').delete().eq('id', id)
  revalidatePath('/admin/kursus')
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/\(admin\)/admin/kursus/actions.ts
git commit -m "feat: server actions for kursus CRUD"
```

---

## Task 5: CRUD Kursus — Dialog + List Page

**Files:**
- Create: `src/app/(admin)/admin/kursus/KursusDialog.tsx`
- Create: `src/app/(admin)/admin/kursus/KursusClient.tsx`
- Create: `src/app/(admin)/admin/kursus/page.tsx`
- Create: `src/test/components/admin/KursusDialog.test.tsx`

- [ ] **Step 1: Buat KursusDialog**

```tsx
// src/app/(admin)/admin/kursus/KursusDialog.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createKursus, updateKursus } from './actions'

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  thumbnail_url: string | null
  is_published: boolean
}

interface KursusDialogProps {
  open: boolean
  onClose: () => void
  course?: Course
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export function KursusDialog({ open, onClose, course }: KursusDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(course?.title ?? '')
  const [slug, setSlug] = useState(course?.slug ?? '')
  const isEdit = !!course

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!isEdit) setSlug(slugify(val))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      if (isEdit) {
        await updateKursus(course.id, formData)
      } else {
        await createKursus(formData)
      }
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#F5F5F0]">
            {isEdit ? 'Edit Kursus' : 'Tambah Kursus'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label>Judul</Label>
            <Input
              name="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Slug</Label>
            <Input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Kategori</Label>
            <Input name="category" defaultValue={course?.category ?? ''} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Deskripsi</Label>
            <textarea
              name="description"
              defaultValue={course?.description ?? ''}
              rows={3}
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-[#F5F5F0] placeholder:text-[#555555] focus:outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Thumbnail URL</Label>
            <Input name="thumbnail_url" defaultValue={course?.thumbnail_url ?? ''} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_published"
              value="true"
              id="kursus_published"
              defaultChecked={course?.is_published ?? false}
              className="accent-[#D4AF37] w-4 h-4"
            />
            <Label htmlFor="kursus_published">Published</Label>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Batal
            </Button>
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

- [ ] **Step 2: Buat KursusClient**

```tsx
// src/app/(admin)/admin/kursus/KursusClient.tsx
'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { KursusDialog } from './KursusDialog'
import { deleteKursus } from './actions'

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  thumbnail_url: string | null
  is_published: boolean
  moduleCount: number
}

export function KursusClient({ courses }: { courses: Course[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Course | undefined>()
  const [, startTransition] = useTransition()

  function openAdd() {
    setEditTarget(undefined)
    setDialogOpen(true)
  }

  function openEdit(course: Course) {
    setEditTarget(course)
    setDialogOpen(true)
  }

  function handleDelete(id: string) {
    if (!confirm('Hapus kursus ini? Semua modul akan ikut terhapus.')) return
    startTransition(() => deleteKursus(id))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#F5F5F0]">Kursus</h1>
        <Button variant="primary" size="sm" onClick={openAdd}>+ Tambah</Button>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1A1A1A]">
              {['Judul', 'Kategori', 'Modul', 'Status', 'Aksi'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#555555] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-b border-[#1A1A1A] last:border-0 hover:bg-[#1A1A1A]/50 transition-colors">
                <td className="px-4 py-3 text-[#F5F5F0] font-medium">{c.title}</td>
                <td className="px-4 py-3 text-[#888888]">{c.category}</td>
                <td className="px-4 py-3 text-[#888888]">{c.moduleCount}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    c.is_published ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'bg-[#1A1A1A] text-[#555555]'
                  }`}>
                    {c.is_published ? 'Aktif' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(c)}
                      className="text-xs text-[#888888] hover:text-[#D4AF37] transition-colors"
                    >
                      Edit
                    </button>
                    <Link
                      href={`/admin/kursus/${c.id}/modul`}
                      className="text-xs text-[#888888] hover:text-[#D4AF37] transition-colors"
                    >
                      Modul
                    </Link>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-xs text-red-500 hover:text-red-400 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#555555]">
                  Belum ada kursus.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <KursusDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        course={editTarget}
      />
    </>
  )
}
```

- [ ] **Step 3: Buat kursus page (Server Component)**

```tsx
// src/app/(admin)/admin/kursus/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { KursusClient } from './KursusClient'

export default async function AdminKursusPage() {
  const supabase = createAdminClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('id, slug, title, description, category, thumbnail_url, is_published, course_modules(count)')
    .order('sort_order')

  const mapped = (courses ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    category: c.category,
    thumbnail_url: c.thumbnail_url,
    is_published: c.is_published,
    moduleCount: (c.course_modules as unknown as [{ count: number }])[0]?.count ?? 0,
  }))

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <KursusClient courses={mapped} />
    </div>
  )
}
```

- [ ] **Step 4: Tulis test KursusDialog**

```tsx
// src/test/components/admin/KursusDialog.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { KursusDialog } from '@/app/(admin)/admin/kursus/KursusDialog'

vi.mock('@/app/(admin)/admin/kursus/actions', () => ({
  createKursus: vi.fn().mockResolvedValue(undefined),
  updateKursus: vi.fn().mockResolvedValue(undefined),
}))

describe('KursusDialog', () => {
  it('renders add form when no course prop', () => {
    render(<KursusDialog open={true} onClose={vi.fn()} />)
    expect(screen.getByText('Tambah Kursus')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tambah/i })).toBeInTheDocument()
  })

  it('renders edit form with prefilled data', () => {
    const course = {
      id: 'abc',
      title: 'Kursus Test',
      slug: 'kursus-test',
      description: null,
      category: 'AI',
      thumbnail_url: null,
      is_published: true,
    }
    render(<KursusDialog open={true} onClose={vi.fn()} course={course} />)
    expect(screen.getByText('Edit Kursus')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Kursus Test')).toBeInTheDocument()
    expect(screen.getByDisplayValue('AI')).toBeInTheDocument()
  })

  it('auto-generates slug from title on add', () => {
    render(<KursusDialog open={true} onClose={vi.fn()} />)
    const titleInput = screen.getByLabelText(/judul/i)
    fireEvent.change(titleInput, { target: { value: 'Kursus Baru!' } })
    expect(screen.getByDisplayValue('kursus-baru')).toBeInTheDocument()
  })

  it('calls onClose when Batal clicked', () => {
    const onClose = vi.fn()
    render(<KursusDialog open={true} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /batal/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
```

- [ ] **Step 5: Jalankan test**

```bash
pnpm test src/test/components/admin/KursusDialog.test.tsx
```

Expected: 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(admin\)/admin/kursus/
git commit -m "feat: admin CRUD kursus dengan dialog dan server actions"
```

---

## Task 6: Kelola Modul — Server Actions + Page

**Files:**
- Create: `src/app/(admin)/admin/kursus/[id]/modul/actions.ts`
- Create: `src/app/(admin)/admin/kursus/[id]/modul/ModulDialog.tsx`
- Create: `src/app/(admin)/admin/kursus/[id]/modul/ModulClient.tsx`
- Create: `src/app/(admin)/admin/kursus/[id]/modul/page.tsx`
- Create: `src/test/components/admin/ModulDialog.test.tsx`

- [ ] **Step 1: Buat server actions modul**

```ts
// src/app/(admin)/admin/kursus/[id]/modul/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createModul(courseId: string, formData: FormData) {
  const supabase = createAdminClient()
  const duration = formData.get('duration_seconds')
  await supabase.from('course_modules').insert({
    course_id: courseId,
    title: formData.get('title') as string,
    video_url: formData.get('video_url') as string,
    duration_seconds: duration ? Number(duration) : null,
    sort_order: Number(formData.get('sort_order') ?? 0),
  })
  revalidatePath(`/admin/kursus/${courseId}/modul`)
}

export async function updateModul(courseId: string, modulId: string, formData: FormData) {
  const supabase = createAdminClient()
  const duration = formData.get('duration_seconds')
  await supabase
    .from('course_modules')
    .update({
      title: formData.get('title') as string,
      video_url: formData.get('video_url') as string,
      duration_seconds: duration ? Number(duration) : null,
      sort_order: Number(formData.get('sort_order') ?? 0),
    })
    .eq('id', modulId)
    .eq('course_id', courseId)
  revalidatePath(`/admin/kursus/${courseId}/modul`)
}

export async function deleteModul(courseId: string, modulId: string) {
  const supabase = createAdminClient()
  await supabase.from('course_modules').delete().eq('id', modulId)
  revalidatePath(`/admin/kursus/${courseId}/modul`)
}
```

- [ ] **Step 2: Buat ModulDialog**

```tsx
// src/app/(admin)/admin/kursus/[id]/modul/ModulDialog.tsx
'use client'

import { useTransition } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createModul, updateModul } from './actions'

interface Modul {
  id: string
  title: string
  video_url: string
  duration_seconds: number | null
  sort_order: number
}

interface ModulDialogProps {
  open: boolean
  onClose: () => void
  courseId: string
  modul?: Modul
}

export function ModulDialog({ open, onClose, courseId, modul }: ModulDialogProps) {
  const [isPending, startTransition] = useTransition()
  const isEdit = !!modul

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      if (isEdit) {
        await updateModul(courseId, modul.id, formData)
      } else {
        await createModul(courseId, formData)
      }
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#F5F5F0]">
            {isEdit ? 'Edit Modul' : 'Tambah Modul'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label>Judul Modul</Label>
            <Input name="title" defaultValue={modul?.title ?? ''} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>YouTube Video URL</Label>
            <Input
              name="video_url"
              defaultValue={modul?.video_url ?? ''}
              placeholder="https://youtu.be/..."
              required
            />
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label>Durasi (detik)</Label>
              <Input
                name="duration_seconds"
                type="number"
                defaultValue={modul?.duration_seconds ?? ''}
                placeholder="misal: 600"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-24">
              <Label>Urutan</Label>
              <Input
                name="sort_order"
                type="number"
                defaultValue={modul?.sort_order ?? 0}
                required
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Batal
            </Button>
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

- [ ] **Step 3: Buat ModulClient**

```tsx
// src/app/(admin)/admin/kursus/[id]/modul/ModulClient.tsx
'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { ModulDialog } from './ModulDialog'
import { deleteModul } from './actions'

interface Modul {
  id: string
  title: string
  video_url: string
  duration_seconds: number | null
  sort_order: number
}

function formatDuration(sec: number | null) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function ModulClient({ courseId, courseTitle, modules }: {
  courseId: string
  courseTitle: string
  modules: Modul[]
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Modul | undefined>()
  const [, startTransition] = useTransition()

  function openAdd() { setEditTarget(undefined); setDialogOpen(true) }
  function openEdit(m: Modul) { setEditTarget(m); setDialogOpen(true) }
  function handleDelete(modulId: string) {
    if (!confirm('Hapus modul ini?')) return
    startTransition(() => deleteModul(courseId, modulId))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[#888888] text-sm mb-1">← <a href="/admin/kursus" className="hover:text-[#D4AF37] transition-colors">Kursus</a></p>
          <h1 className="text-2xl font-bold text-[#F5F5F0]">{courseTitle} — Modul</h1>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>+ Tambah Modul</Button>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1A1A1A]">
              {['#', 'Judul', 'Video URL', 'Durasi', 'Aksi'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#555555] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((m, i) => (
              <tr key={m.id} className="border-b border-[#1A1A1A] last:border-0 hover:bg-[#1A1A1A]/50 transition-colors">
                <td className="px-4 py-3 text-[#555555] font-mono text-xs">{i + 1}</td>
                <td className="px-4 py-3 text-[#F5F5F0]">{m.title}</td>
                <td className="px-4 py-3 text-[#888888] max-w-xs truncate">{m.video_url}</td>
                <td className="px-4 py-3 text-[#888888]">{formatDuration(m.duration_seconds)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(m)} className="text-xs text-[#888888] hover:text-[#D4AF37] transition-colors">Edit</button>
                    <button onClick={() => handleDelete(m.id)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {modules.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#555555]">Belum ada modul.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ModulDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        courseId={courseId}
        modul={editTarget}
      />
    </>
  )
}
```

- [ ] **Step 4: Buat modul page**

```tsx
// src/app/(admin)/admin/kursus/[id]/modul/page.tsx
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { ModulClient } from './ModulClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminModulPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const [{ data: course }, { data: modules }] = await Promise.all([
    supabase.from('courses').select('id, title').eq('id', id).single(),
    supabase.from('course_modules').select('id, title, video_url, duration_seconds, sort_order').eq('course_id', id).order('sort_order'),
  ])

  if (!course) notFound()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <ModulClient courseId={id} courseTitle={course.title} modules={modules ?? []} />
    </div>
  )
}
```

- [ ] **Step 5: Tulis test ModulDialog**

```tsx
// src/test/components/admin/ModulDialog.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ModulDialog } from '@/app/(admin)/admin/kursus/[id]/modul/ModulDialog'

vi.mock('@/app/(admin)/admin/kursus/[id]/modul/actions', () => ({
  createModul: vi.fn().mockResolvedValue(undefined),
  updateModul: vi.fn().mockResolvedValue(undefined),
}))

describe('ModulDialog', () => {
  it('renders add form', () => {
    render(<ModulDialog open={true} onClose={vi.fn()} courseId="course-1" />)
    expect(screen.getByText('Tambah Modul')).toBeInTheDocument()
  })

  it('renders edit form with prefilled data', () => {
    const modul = { id: 'm1', title: 'Intro', video_url: 'https://youtu.be/abc', duration_seconds: 300, sort_order: 1 }
    render(<ModulDialog open={true} onClose={vi.fn()} courseId="course-1" modul={modul} />)
    expect(screen.getByText('Edit Modul')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Intro')).toBeInTheDocument()
  })

  it('calls onClose on Batal', () => {
    const onClose = vi.fn()
    render(<ModulDialog open={true} onClose={onClose} courseId="course-1" />)
    fireEvent.click(screen.getByRole('button', { name: /batal/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
```

- [ ] **Step 6: Jalankan test**

```bash
pnpm test src/test/components/admin/ModulDialog.test.tsx
```

Expected: 3 tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/app/\(admin\)/admin/kursus/
git commit -m "feat: admin kelola modul kursus (CRUD + dialog)"
```

---

## Task 7: CRUD Ebook — Server Actions + Dialog + Page

**Files:**
- Create: `src/app/(admin)/admin/ebook/actions.ts`
- Create: `src/app/(admin)/admin/ebook/EbookDialog.tsx`
- Create: `src/app/(admin)/admin/ebook/EbookClient.tsx`
- Create: `src/app/(admin)/admin/ebook/page.tsx`
- Create: `src/test/components/admin/EbookDialog.test.tsx`

- [ ] **Step 1: Buat server actions ebook**

```ts
// src/app/(admin)/admin/ebook/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createEbook(formData: FormData) {
  const supabase = createAdminClient()
  const pageCount = formData.get('page_count')
  await supabase.from('ebooks').insert({
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    category: formData.get('category') as string,
    cover_url: (formData.get('cover_url') as string) || null,
    file_path: formData.get('file_path') as string,
    page_count: pageCount ? Number(pageCount) : null,
    is_published: formData.get('is_published') === 'true',
  })
  revalidatePath('/admin/ebook')
}

export async function updateEbook(id: string, formData: FormData) {
  const supabase = createAdminClient()
  const pageCount = formData.get('page_count')
  await supabase
    .from('ebooks')
    .update({
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      description: (formData.get('description') as string) || null,
      category: formData.get('category') as string,
      cover_url: (formData.get('cover_url') as string) || null,
      file_path: formData.get('file_path') as string,
      page_count: pageCount ? Number(pageCount) : null,
      is_published: formData.get('is_published') === 'true',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  revalidatePath('/admin/ebook')
}

export async function deleteEbook(id: string) {
  const supabase = createAdminClient()
  await supabase.from('ebooks').delete().eq('id', id)
  revalidatePath('/admin/ebook')
}
```

- [ ] **Step 2: Buat EbookDialog (dengan upload PDF)**

```tsx
// src/app/(admin)/admin/ebook/EbookDialog.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { createEbook, updateEbook } from './actions'

interface Ebook {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  cover_url: string | null
  file_path: string
  page_count: number | null
  is_published: boolean
}

interface EbookDialogProps {
  open: boolean
  onClose: () => void
  ebook?: Ebook
}

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function EbookDialog({ open, onClose, ebook }: EbookDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(ebook?.title ?? '')
  const [slug, setSlug] = useState(ebook?.slug ?? '')
  const [filePath, setFilePath] = useState(ebook?.file_path ?? '')
  const [uploading, setUploading] = useState(false)
  const isEdit = !!ebook

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!isEdit) setSlug(slugify(val))
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${slugify(file.name.replace(`.${ext}`, ''))}.${ext}`
      const { error } = await supabase.storage.from('ebooks').upload(path, file, { upsert: false })
      if (error) throw error
      setFilePath(path)
    } finally {
      setUploading(false)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('file_path', filePath)
    startTransition(async () => {
      if (isEdit) {
        await updateEbook(ebook.id, formData)
      } else {
        await createEbook(formData)
      }
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#F5F5F0]">
            {isEdit ? 'Edit Ebook' : 'Tambah Ebook'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label>Judul</Label>
            <Input name="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Slug</Label>
            <Input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Kategori</Label>
            <Input name="category" defaultValue={ebook?.category ?? ''} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Deskripsi</Label>
            <textarea
              name="description"
              defaultValue={ebook?.description ?? ''}
              rows={2}
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-[#F5F5F0] placeholder:text-[#555555] focus:outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label>Cover URL</Label>
              <Input name="cover_url" defaultValue={ebook?.cover_url ?? ''} />
            </div>
            <div className="flex flex-col gap-1.5 w-28">
              <Label>Jumlah Hal.</Label>
              <Input name="page_count" type="number" defaultValue={ebook?.page_count ?? ''} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>File PDF</Label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="text-sm text-[#888888] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#222222] file:text-[#F5F5F0] file:text-xs file:cursor-pointer hover:file:bg-[#2A2A2A]"
            />
            {uploading && <p className="text-xs text-[#D4AF37]">Mengupload...</p>}
            {filePath && !uploading && (
              <p className="text-xs text-green-400 truncate">✓ {filePath}</p>
            )}
            {!filePath && !uploading && isEdit && (
              <p className="text-xs text-[#555555]">Kosongkan jika tidak ingin ganti file.</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_published"
              value="true"
              id="ebook_published"
              defaultChecked={ebook?.is_published ?? false}
              className="accent-[#D4AF37] w-4 h-4"
            />
            <Label htmlFor="ebook_published">Published</Label>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>Batal</Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isPending || uploading}
              disabled={!filePath && !isEdit}
            >
              {isEdit ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Buat EbookClient**

```tsx
// src/app/(admin)/admin/ebook/EbookClient.tsx
'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { EbookDialog } from './EbookDialog'
import { deleteEbook } from './actions'

interface Ebook {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  cover_url: string | null
  file_path: string
  page_count: number | null
  is_published: boolean
}

export function EbookClient({ ebooks }: { ebooks: Ebook[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Ebook | undefined>()
  const [, startTransition] = useTransition()

  function openAdd() { setEditTarget(undefined); setDialogOpen(true) }
  function openEdit(e: Ebook) { setEditTarget(e); setDialogOpen(true) }
  function handleDelete(id: string) {
    if (!confirm('Hapus ebook ini?')) return
    startTransition(() => deleteEbook(id))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#F5F5F0]">Ebook</h1>
        <Button variant="primary" size="sm" onClick={openAdd}>+ Tambah</Button>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1A1A1A]">
              {['Judul', 'Kategori', 'Hal.', 'Status', 'Aksi'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#555555] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ebooks.map((e) => (
              <tr key={e.id} className="border-b border-[#1A1A1A] last:border-0 hover:bg-[#1A1A1A]/50 transition-colors">
                <td className="px-4 py-3 text-[#F5F5F0] font-medium">{e.title}</td>
                <td className="px-4 py-3 text-[#888888]">{e.category}</td>
                <td className="px-4 py-3 text-[#888888]">{e.page_count ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    e.is_published ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'bg-[#1A1A1A] text-[#555555]'
                  }`}>
                    {e.is_published ? 'Aktif' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(e)} className="text-xs text-[#888888] hover:text-[#D4AF37] transition-colors">Edit</button>
                    <button onClick={() => handleDelete(e.id)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {ebooks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#555555]">Belum ada ebook.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EbookDialog open={dialogOpen} onClose={() => setDialogOpen(false)} ebook={editTarget} />
    </>
  )
}
```

- [ ] **Step 4: Buat ebook page**

```tsx
// src/app/(admin)/admin/ebook/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { EbookClient } from './EbookClient'

export default async function AdminEbookPage() {
  const supabase = createAdminClient()
  const { data: ebooks } = await supabase
    .from('ebooks')
    .select('id, slug, title, description, category, cover_url, file_path, page_count, is_published')
    .order('sort_order')

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <EbookClient ebooks={ebooks ?? []} />
    </div>
  )
}
```

- [ ] **Step 5: Tulis test EbookDialog**

```tsx
// src/test/components/admin/EbookDialog.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EbookDialog } from '@/app/(admin)/admin/ebook/EbookDialog'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    storage: { from: () => ({ upload: vi.fn().mockResolvedValue({ error: null }) }) },
  }),
}))

vi.mock('@/app/(admin)/admin/ebook/actions', () => ({
  createEbook: vi.fn().mockResolvedValue(undefined),
  updateEbook: vi.fn().mockResolvedValue(undefined),
}))

describe('EbookDialog', () => {
  it('renders add form', () => {
    render(<EbookDialog open={true} onClose={vi.fn()} />)
    expect(screen.getByText('Tambah Ebook')).toBeInTheDocument()
  })

  it('renders edit form with prefilled data', () => {
    const ebook = {
      id: 'e1', title: 'Panduan AI', slug: 'panduan-ai',
      description: null, category: 'AI', cover_url: null,
      file_path: 'ebooks/test.pdf', page_count: 50, is_published: true,
    }
    render(<EbookDialog open={true} onClose={vi.fn()} ebook={ebook} />)
    expect(screen.getByText('Edit Ebook')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Panduan AI')).toBeInTheDocument()
    expect(screen.getByText(/ebooks\/test\.pdf/)).toBeInTheDocument()
  })

  it('calls onClose on Batal', () => {
    const onClose = vi.fn()
    render(<EbookDialog open={true} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /batal/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
```

- [ ] **Step 6: Jalankan test**

```bash
pnpm test src/test/components/admin/EbookDialog.test.tsx
```

Expected: 3 tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/app/\(admin\)/admin/ebook/
git commit -m "feat: admin CRUD ebook dengan upload PDF ke Supabase Storage"
```

---

## Task 8: Jalankan semua test + update Plans.md

- [ ] **Step 1: Jalankan full test suite**

```bash
pnpm test
```

Expected: semua test pass (termasuk 20 test lama + 10 test admin baru).

- [ ] **Step 2: Update Plans.md**

Tandai semua task Week 7 sebagai `[x]` di `Plans.md`.

- [ ] **Step 3: Commit final**

```bash
git add Plans.md
git commit -m "chore: mark Week 7 admin panel complete in Plans.md"
```
