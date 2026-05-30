# Admin Materi Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename admin route `/admin/ebook` → `/admin/materi`, rename semua label Ebook→Materi, tambah field `is_featured` dan `videos` (dynamic YouTube rows) di form materi.

**Architecture:** Task 1 rename folder + files via `git mv`. Task 2 update AdminSidebar href. Task 3-5 update konten file (query, client table, dialog form, actions). Tidak ada komponen baru.

**Tech Stack:** Next.js 16 App Router, Supabase, Tailwind CSS, React useState

---

## File Map

| File | Action |
|---|---|
| `src/app/(admin)/admin/ebook/` → `src/app/(admin)/admin/materi/` | `git mv` folder |
| `EbookClient.tsx` → `MateriClient.tsx` | `git mv` + update imports |
| `EbookDialog.tsx` → `MateriDialog.tsx` | `git mv` + update imports |
| `src/components/admin/AdminSidebar.tsx` | Update href + label |
| `src/app/(admin)/admin/materi/page.tsx` | Add `is_featured`, `videos` to query |
| `src/app/(admin)/admin/materi/MateriClient.tsx` | Rename labels, interface, Featured badge, video count |
| `src/app/(admin)/admin/materi/MateriDialog.tsx` | Rename labels, add is_featured, dynamic video rows |
| `src/app/(admin)/admin/materi/actions.ts` | Handle is_featured, videos, revalidate `/admin/materi` |

---

## Task 1: Rename Folder + Files

**Files:**
- Rename: `src/app/(admin)/admin/ebook/` → `src/app/(admin)/admin/materi/`
- Rename: `EbookClient.tsx` → `MateriClient.tsx`
- Rename: `EbookDialog.tsx` → `MateriDialog.tsx`

- [ ] **Step 1: git mv folder dan files**

```bash
git mv "src/app/(admin)/admin/ebook" "src/app/(admin)/admin/materi"
git mv "src/app/(admin)/admin/materi/EbookClient.tsx" "src/app/(admin)/admin/materi/MateriClient.tsx"
git mv "src/app/(admin)/admin/materi/EbookDialog.tsx" "src/app/(admin)/admin/materi/MateriDialog.tsx"
```

- [ ] **Step 2: Update import di page.tsx**

Buka `src/app/(admin)/admin/materi/page.tsx`, ganti:
```ts
// SEBELUM
import { EbookClient } from './EbookClient'
// SESUDAH
import { MateriClient } from './MateriClient'
```

Dan ganti `<EbookClient ebooks={ebooks ?? []} />` → `<MateriClient ebooks={ebooks ?? []} />`.

- [ ] **Step 3: Update import di MateriClient.tsx**

Buka `src/app/(admin)/admin/materi/MateriClient.tsx`, ganti:
```ts
// SEBELUM
import { EbookDialog } from './EbookDialog'
// SESUDAH
import { MateriDialog } from './MateriDialog'
```

Dan ganti `<EbookDialog ...>` → `<MateriDialog ...>`.

- [ ] **Step 4: Update nama fungsi export di MateriClient.tsx**

Ganti `export function EbookClient` → `export function MateriClient`.

- [ ] **Step 5: Update nama fungsi export di MateriDialog.tsx**

Ganti `export function EbookDialog` → `export function MateriDialog`.
Ganti props type `EbookDialogProps` → `MateriDialogProps`.
Ganti interface `Ebook` → `Materi` dan props `ebook?: Ebook` → `materi?: Materi`.

- [ ] **Step 6: Typecheck dan commit**

```bash
pnpm typecheck
git add -A
git commit -m "feat(admin): rename ebook folder/files to materi"
```

---

## Task 2: AdminSidebar — Update href dan label

**Files:**
- Modify: `src/components/admin/AdminSidebar.tsx`

- [ ] **Step 1: Ganti label dan href**

```ts
// SEBELUM
{ label: 'Ebook', href: '/admin/ebook' },
// SESUDAH
{ label: 'Materi', href: '/admin/materi' },
```

- [ ] **Step 2: Commit**

```bash
pnpm typecheck
git add src/components/admin/AdminSidebar.tsx
git commit -m "feat(admin): sidebar nav Ebook→Materi with /admin/materi href"
```

---

## Task 3: Update Query + MateriClient Table

**Files:**
- Modify: `src/app/(admin)/admin/materi/page.tsx`
- Modify: `src/app/(admin)/admin/materi/MateriClient.tsx`

- [ ] **Step 1: Update select query di page.tsx**

Ganti:
```ts
.select('id, slug, title, description, category, cover_url, file_path, page_count, is_published')
```
Menjadi:
```ts
.select('id, slug, title, description, category, cover_url, file_path, page_count, is_published, is_featured, videos')
```

- [ ] **Step 2: Ganti seluruh isi MateriClient.tsx**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { MateriDialog } from './MateriDialog'
import { deleteEbook } from './actions'

interface VideoItem {
  title: string
  url: string
}

interface Materi {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  cover_url: string | null
  file_path: string
  page_count: number | null
  is_published: boolean
  is_featured: boolean | null
  videos: VideoItem[] | null
}

export function MateriClient({ ebooks: materis }: { ebooks: Materi[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Materi | undefined>()
  const [, startTransition] = useTransition()

  function openAdd() { setEditTarget(undefined); setDialogOpen(true) }
  function openEdit(m: Materi) { setEditTarget(m); setDialogOpen(true) }
  function handleDelete(id: string) {
    if (!confirm('Hapus materi ini?')) return
    startTransition(() => deleteEbook(id))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#F5F5F0]">Materi</h1>
        <Button variant="primary" size="sm" onClick={openAdd}>+ Tambah</Button>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222222]">
              {['Judul', 'Kategori', 'Hal.', 'Video', 'Status', 'Aksi'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#555555] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {materis.map((m) => (
              <tr key={m.id} className="border-b border-[#222222] last:border-0 hover:bg-[#1A1A1A]/50 transition-colors">
                <td className="px-4 py-3 text-[#F5F5F0] font-medium">
                  <div className="flex items-center gap-2">
                    {m.is_featured && <span className="text-[#D4AF37] text-[10px] font-bold">★</span>}
                    {m.title}
                  </div>
                </td>
                <td className="px-4 py-3 text-[#888888]">{m.category}</td>
                <td className="px-4 py-3 text-[#888888]">{m.page_count ?? '—'}</td>
                <td className="px-4 py-3 text-[#888888]">
                  {m.videos && m.videos.length > 0
                    ? <span className="text-[#D4AF37] text-xs">{m.videos.length} video</span>
                    : <span className="text-[#333]">—</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    m.is_published ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'bg-[#1A1A1A] text-[#555555]'
                  }`}>
                    {m.is_published ? 'Aktif' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(m)} className="text-xs text-[#888888] hover:text-[#D4AF37] transition-colors">Edit</button>
                    <button onClick={() => handleDelete(m.id)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {materis.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#555555]">Belum ada materi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <MateriDialog open={dialogOpen} onClose={() => setDialogOpen(false)} materi={editTarget} />
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
pnpm typecheck
git add "src/app/(admin)/admin/materi/page.tsx" "src/app/(admin)/admin/materi/MateriClient.tsx"
git commit -m "feat(admin): update query + MateriClient table with featured badge and video count"
```

---

## Task 4: MateriDialog — is_featured + Dynamic Video Rows

**Files:**
- Modify: `src/app/(admin)/admin/materi/MateriDialog.tsx`

- [ ] **Step 1: Ganti seluruh isi MateriDialog.tsx**

```tsx
'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { createEbook, updateEbook } from './actions'
import { toast } from 'sonner'

const MAX_COVER_SIZE_MB = 5

function parseGdriveUrl(input: string): string | null {
  input = input.trim()
  const fileMatch = input.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`
  const openMatch = input.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/)
  if (openMatch) return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`
  if (input.includes('drive.google.com/uc') && input.includes('export=download')) return input
  return null
}

interface VideoItem {
  title: string
  url: string
}

interface Materi {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  cover_url: string | null
  file_path: string
  page_count: number | null
  is_published: boolean
  is_featured: boolean | null
  videos: VideoItem[] | null
}

interface MateriDialogProps {
  open: boolean
  onClose: () => void
  materi?: Materi
}

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function MateriDialog({ open, onClose, materi }: MateriDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(materi?.title ?? '')
  const [slug, setSlug] = useState(materi?.slug ?? '')
  const [filePath, setFilePath] = useState(materi?.file_path ?? '')
  const [gdriveInput, setGdriveInput] = useState('')
  const [gdriveValid, setGdriveValid] = useState<boolean | null>(null)
  const [coverUrl, setCoverUrl] = useState(materi?.cover_url ?? '')
  const [uploadingCover, setUploadingCover] = useState(false)
  const [isPublished, setIsPublished] = useState(materi?.is_published ?? false)
  const [isFeatured, setIsFeatured] = useState(materi?.is_featured ?? false)
  const [videos, setVideos] = useState<VideoItem[]>(materi?.videos ?? [])
  const isEdit = !!materi

  useEffect(() => {
    setTitle(materi?.title ?? '')
    setSlug(materi?.slug ?? '')
    setFilePath(materi?.file_path ?? '')
    setCoverUrl(materi?.cover_url ?? '')
    setIsPublished(materi?.is_published ?? false)
    setIsFeatured(materi?.is_featured ?? false)
    setVideos(materi?.videos ?? [])
    const existing = materi?.file_path ?? ''
    setGdriveInput(existing.startsWith('https://') ? existing : '')
    setGdriveValid(null)
  }, [open, materi])

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > MAX_COVER_SIZE_MB) {
      toast.error(`Cover terlalu besar (${sizeMB.toFixed(1)} MB). Maksimal ${MAX_COVER_SIZE_MB} MB.`)
      e.target.value = ''
      return
    }
    setUploadingCover(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `ebooks/${Date.now()}-${slugify(file.name.replace(`.${ext}`, ''))}.${ext}`
      const { error } = await supabase.storage.from('image').upload(path, file, { upsert: false })
      if (error) throw error
      const { data } = supabase.storage.from('image').getPublicUrl(path)
      setCoverUrl(data.publicUrl)
      toast.success('Cover berhasil diupload!')
    } catch (err) {
      console.error('[MateriDialog cover upload]', err)
      toast.error('Gagal mengupload cover. Coba lagi.')
    } finally {
      setUploadingCover(false)
    }
  }

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!isEdit) setSlug(slugify(val))
  }

  function handleGdriveChange(val: string) {
    setGdriveInput(val)
    if (!val.trim()) {
      setGdriveValid(null)
      setFilePath(isEdit ? materi?.file_path ?? '' : '')
      return
    }
    const converted = parseGdriveUrl(val)
    if (converted) { setFilePath(converted); setGdriveValid(true) }
    else { setFilePath(''); setGdriveValid(false) }
  }

  function addVideo() { setVideos([...videos, { title: '', url: '' }]) }
  function removeVideo(index: number) { setVideos(videos.filter((_, i) => i !== index)) }
  function updateVideo(index: number, field: 'title' | 'url', value: string) {
    setVideos(videos.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('file_path', filePath)
    formData.set('is_featured', isFeatured ? 'true' : 'false')
    const validVideos = videos.filter(v => v.title.trim() && v.url.trim())
    formData.set('videos', validVideos.length > 0 ? JSON.stringify(validVideos) : '')
    startTransition(async () => {
      if (isEdit) {
        await updateEbook(materi.id, formData)
      } else {
        await createEbook(formData)
      }
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#F5F5F0]">
            {isEdit ? 'Edit Materi' : 'Tambah Materi'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m_title">Judul</Label>
            <Input id="m_title" name="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m_slug">Slug</Label>
            <Input id="m_slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m_category">Kategori</Label>
            <select
              id="m_category"
              name="category"
              defaultValue={materi?.category ?? ''}
              required
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="" disabled>Pilih kategori</option>
              <option value="Bisnis">Bisnis</option>
              <option value="Freelancing">Freelancing</option>
              <option value="Konten">Konten</option>
              <option value="Otomasi">Otomasi</option>
              <option value="Prompt">Prompt</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m_description">Deskripsi</Label>
            <textarea
              id="m_description"
              name="description"
              defaultValue={materi?.description ?? ''}
              rows={2}
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-[#F5F5F0] placeholder:text-[#555555] focus:outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label>Cover</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="text-sm text-[#888888] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#222222] file:text-[#F5F5F0] file:text-xs file:cursor-pointer hover:file:bg-[#2A2A2A]"
              />
              {uploadingCover && <p className="text-xs text-[#D4AF37]">Mengupload...</p>}
              {coverUrl && !uploadingCover && <p className="text-xs text-green-400">&#10003; Cover siap</p>}
              <input type="hidden" name="cover_url" value={coverUrl} />
            </div>
            <div className="flex flex-col gap-1.5 w-28">
              <Label htmlFor="m_page_count">Jumlah Hal.</Label>
              <Input id="m_page_count" name="page_count" type="number" defaultValue={materi?.page_count ?? ''} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m_gdrive">Link Google Drive PDF</Label>
            <Input
              id="m_gdrive"
              type="url"
              placeholder="https://drive.google.com/file/d/FILE_ID/view"
              value={gdriveInput}
              onChange={(e) => handleGdriveChange(e.target.value)}
              error={gdriveValid === false}
            />
            {gdriveValid === true && <p className="text-xs text-green-400">&#10003; Link valid — akan otomatis jadi direct download.</p>}
            {gdriveValid === false && <p className="text-xs text-red-400">Link bukan dari Google Drive atau format tidak dikenali.</p>}
            {!gdriveInput && isEdit && <p className="text-xs text-[#555555]">Kosongkan jika tidak ingin ganti link.</p>}
          </div>

          {/* VIDEO SECTION */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Video YouTube (opsional)</Label>
              <button type="button" onClick={addVideo} className="text-xs text-[#D4AF37] hover:underline">
                + Tambah Video
              </button>
            </div>
            {videos.length === 0 && (
              <p className="text-xs text-[#444]">Belum ada video. Klik "+ Tambah Video" untuk menambahkan.</p>
            )}
            {videos.map((video, index) => (
              <div key={index} className="flex flex-col gap-2 bg-[#111] border border-[#222] rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#555] font-medium">Video {index + 1}</span>
                  <button type="button" onClick={() => removeVideo(index)} className="text-xs text-red-500 hover:text-red-400">Hapus</button>
                </div>
                <Input
                  placeholder="Judul video (misal: Pengenalan Prompt)"
                  value={video.title}
                  onChange={(e) => updateVideo(index, 'title', e.target.value)}
                />
                <Input
                  placeholder="YouTube URL atau video ID (misal: dQw4w9WgXcQ)"
                  value={video.url}
                  onChange={(e) => updateVideo(index, 'url', e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="m_featured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-[#D4AF37] w-4 h-4" />
              <Label htmlFor="m_featured">Jadikan Materi Pilihan (★ Featured di Dashboard)</Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="is_published" value="true" id="m_published" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="accent-[#D4AF37] w-4 h-4" />
              <Label htmlFor="m_published">Published</Label>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>Batal</Button>
            <Button type="submit" variant="primary" size="sm" loading={isPending} disabled={!filePath && !isEdit}>
              {isEdit ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Commit**

```bash
pnpm typecheck
git add "src/app/(admin)/admin/materi/MateriDialog.tsx"
git commit -m "feat(admin): MateriDialog — is_featured toggle + dynamic YouTube video rows"
```

---

## Task 5: actions.ts — Handle is_featured, videos, revalidate /admin/materi

**Files:**
- Modify: `src/app/(admin)/admin/materi/actions.ts`

- [ ] **Step 1: Ganti seluruh isi actions.ts**

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export async function createEbook(formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const pageCount = formData.get('page_count')
  const videosRaw = formData.get('videos') as string
  const { error } = await supabase.from('ebooks').insert({
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    category: formData.get('category') as string,
    cover_url: (formData.get('cover_url') as string) || null,
    file_path: formData.get('file_path') as string,
    page_count: pageCount ? Number(pageCount) : null,
    is_published: formData.get('is_published') === 'true',
    is_featured: formData.get('is_featured') === 'true',
    videos: videosRaw ? JSON.parse(videosRaw) : null,
  })
  if (error) {
    console.error('[createEbook]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/materi')
  revalidatePath('/materi')
  revalidatePath('/dashboard')
}

export async function updateEbook(id: string, formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const pageCount = formData.get('page_count')
  const videosRaw = formData.get('videos') as string
  const { error } = await supabase
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
      is_featured: formData.get('is_featured') === 'true',
      videos: videosRaw ? JSON.parse(videosRaw) : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) {
    console.error('[updateEbook]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/materi')
  revalidatePath('/materi')
  revalidatePath('/dashboard')
}

export async function deleteEbook(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('ebooks').delete().eq('id', id)
  if (error) {
    console.error('[deleteEbook]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/materi')
  revalidatePath('/materi')
  revalidatePath('/dashboard')
}
```

- [ ] **Step 2: Typecheck + build + push**

```bash
pnpm typecheck
pnpm build
git add "src/app/(admin)/admin/materi/actions.ts"
git commit -m "feat(admin): handle is_featured, videos in CRUD, revalidate /admin/materi"
git push
```

---

## Verification Checklist

- [ ] `/admin/materi` — route baru berfungsi (tidak 404)
- [ ] Sidebar: "Materi" link ke `/admin/materi`
- [ ] Tabel: heading "Materi", kolom Video count, ★ featured badge
- [ ] Dialog "Tambah Materi" / "Edit Materi"
- [ ] Checkbox "Jadikan Materi Pilihan" berfungsi
- [ ] "+ Tambah Video" muncul baris input Judul + YouTube URL
- [ ] Bisa add/remove multiple video
- [ ] Simpan → data tersimpan di Supabase (`is_featured`, `videos` kolom)
- [ ] Set is_featured=true → dashboard user menampilkan ★ Materi Pilihan
- [ ] `pnpm build` → success
