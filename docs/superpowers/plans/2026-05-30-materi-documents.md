# Materi Dokumen Tambahan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah fitur "Dokumen Tambahan" — admin bisa input multiple Google Drive links per materi, member bisa download dari halaman detail materi.

**Architecture:** Tambah kolom `documents JSONB` ke tabel `ebooks`. Update admin MateriDialog dengan dynamic rows (title + GDrive URL auto-convert). Update user-facing `/materi/[slug]` dengan section "Dokumen Tambahan". getCachedEbooks tidak perlu update karena detail page query langsung ke Supabase (bukan cache).

**Tech Stack:** Next.js 16 App Router, Supabase, Tailwind CSS

---

## File Map

| File | Action |
|---|---|
| `supabase/migrations/006_add_documents_to_ebooks.sql` | Create |
| `src/app/(admin)/admin/materi/MateriDialog.tsx` | Modify — add dynamic document rows |
| `src/app/(admin)/admin/materi/MateriClient.tsx` | Modify — add documents to interface |
| `src/app/(admin)/admin/materi/page.tsx` | Modify — add documents to query |
| `src/app/(admin)/admin/materi/actions.ts` | Modify — handle documents in CRUD |
| `src/app/(member)/materi/[slug]/page.tsx` | Modify — add Dokumen Tambahan section |

---

## Task 1: DB Migration

**Files:**
- Create: `supabase/migrations/006_add_documents_to_ebooks.sql`

- [ ] **Step 1: Buat file migrasi**

```sql
-- supabase/migrations/006_add_documents_to_ebooks.sql
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT NULL;
```

- [ ] **Step 2: Jalankan di Supabase SQL Editor (manual)**

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/006_add_documents_to_ebooks.sql
git commit -m "feat(db): add documents JSONB column to ebooks"
```

---

## Task 2: Admin — MateriDialog Dynamic Document Rows

**Files:**
- Modify: `src/app/(admin)/admin/materi/MateriDialog.tsx`

Add document state dan rows di bawah section video, sebelum is_featured/is_published checkboxes.

- [ ] **Step 1: Tambah DocumentItem type dan state**

Di dalam `MateriDialog`, setelah `VideoItem` type, tambah:
```ts
interface DocumentItem {
  title: string
  url: string
}
```

Tambah state setelah `videos` state:
```ts
const [documents, setDocuments] = useState<DocumentItem[]>(materi?.documents ?? [])
```

- [ ] **Step 2: Reset documents di useEffect**

Di dalam `useEffect`, tambah setelah `setVideos(materi?.videos ?? [])`:
```ts
setDocuments(materi?.documents ?? [])
```

- [ ] **Step 3: Tambah helper functions**

Setelah `updateVideo` function, tambah:
```ts
function addDocument() { setDocuments([...documents, { title: '', url: '' }]) }
function removeDocument(index: number) { setDocuments(documents.filter((_, i) => i !== index)) }
function updateDocument(index: number, field: 'title' | 'url', value: string) {
  setDocuments(documents.map((d, i) => i === index ? { ...d, [field]: value } : d))
}
```

- [ ] **Step 4: Set documents di handleSubmit**

Di dalam `handleSubmit`, setelah `formData.set('videos', ...)`, tambah:
```ts
const validDocs = documents.filter(d => d.title.trim() && d.url.trim())
formData.set('documents', validDocs.length > 0 ? JSON.stringify(validDocs) : '')
```

- [ ] **Step 5: Tambah UI section dokumen**

Di dalam form JSX, setelah `{/* VIDEO SECTION */}` block dan sebelum `<div className="flex flex-col gap-2">` (checkboxes), tambah:

```tsx
{/* DOKUMEN TAMBAHAN */}
<div className="flex flex-col gap-2">
  <div className="flex items-center justify-between">
    <Label>Dokumen Tambahan (opsional)</Label>
    <button type="button" onClick={addDocument} className="text-xs text-[#D4AF37] hover:underline">
      + Tambah Dokumen
    </button>
  </div>
  {documents.length === 0 && (
    <p className="text-xs text-[#444]">Belum ada dokumen. Klik &quot;+ Tambah Dokumen&quot; untuk menambahkan.</p>
  )}
  {documents.map((doc, index) => (
    <div key={index} className="flex flex-col gap-2 bg-[#111] border border-[#222] rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#555] font-medium">Dokumen {index + 1}</span>
        <button type="button" onClick={() => removeDocument(index)} className="text-xs text-red-500 hover:text-red-400">Hapus</button>
      </div>
      <Input
        placeholder="Judul dokumen (misal: Slide Presentasi)"
        value={doc.title}
        onChange={(e) => updateDocument(index, 'title', e.target.value)}
      />
      <Input
        placeholder="Google Drive URL (https://drive.google.com/file/d/...)"
        value={doc.url}
        onChange={(e) => updateDocument(index, 'url', e.target.value)}
      />
    </div>
  ))}
</div>
```

- [ ] **Step 6: Typecheck dan commit**

```bash
pnpm typecheck
git add "src/app/(admin)/admin/materi/MateriDialog.tsx"
git commit -m "feat(admin): add dynamic document rows to MateriDialog"
```

---

## Task 3: Admin — Update Interface, Query, Actions

**Files:**
- Modify: `src/app/(admin)/admin/materi/MateriClient.tsx`
- Modify: `src/app/(admin)/admin/materi/page.tsx`
- Modify: `src/app/(admin)/admin/materi/actions.ts`

- [ ] **Step 1: Tambah documents ke interface Materi di MateriClient.tsx**

Di interface `Materi`, tambah setelah `videos`:
```ts
documents: { title: string; url: string }[] | null
```

- [ ] **Step 2: Tambah documents ke select query di page.tsx**

Ganti select:
```ts
// SEBELUM
.select('id, slug, title, description, category, cover_url, file_path, page_count, is_published, is_featured, videos')
// SESUDAH
.select('id, slug, title, description, category, cover_url, file_path, page_count, is_published, is_featured, videos, documents')
```

Juga update interface `Materi` di page.tsx:
```ts
documents: { title: string; url: string }[] | null
```

- [ ] **Step 3: Handle documents di actions.ts**

Di `createEbook`, setelah `const videosRaw = formData.get('videos') as string`, tambah:
```ts
const documentsRaw = formData.get('documents') as string
```

Di insert object, tambah:
```ts
documents: documentsRaw ? JSON.parse(documentsRaw) : null,
```

Di `updateEbook`, lakukan hal yang sama (tambah `documentsRaw` dan `documents` di update object).

- [ ] **Step 4: Typecheck dan commit**

```bash
pnpm typecheck
git add "src/app/(admin)/admin/materi/MateriClient.tsx" "src/app/(admin)/admin/materi/page.tsx" "src/app/(admin)/admin/materi/actions.ts"
git commit -m "feat(admin): add documents field to query, interface, and CRUD actions"
```

---

## Task 4: User — Dokumen Tambahan Section di Detail Page

**Files:**
- Modify: `src/app/(member)/materi/[slug]/page.tsx`

- [ ] **Step 1: Tambah DocumentItem ke type dan query**

Di `page.tsx`, update interface `MateriData`:
```ts
interface MateriData {
  id: string
  slug: string
  title: string
  description: string | null
  category: string
  cover_url: string | null
  page_count: number | null
  videos: unknown
  documents: unknown
}
```

Update select query — tambah `documents`:
```ts
.select('id, slug, title, description, category, cover_url, page_count, videos, documents')
```

- [ ] **Step 2: Parse documents**

Setelah `const videos = ...`, tambah:
```ts
type DocumentItem = { title: string; url: string }
const documents = Array.isArray(materi.documents) ? (materi.documents as DocumentItem[]) : null
```

- [ ] **Step 3: Tambah section Dokumen Tambahan di JSX**

Setelah section Video (`{videos && videos.length > 0 && (...)}`), tambah:

```tsx
{/* ④ Dokumen Tambahan */}
{documents && documents.length > 0 && (
  <section className="mt-6">
    <p className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-3">
      Dokumen Tambahan
    </p>
    <div className="bg-[#0E0E0E] border border-[#1A1A1A] rounded-xl p-5 md:p-6">
      <div className="flex flex-col gap-3">
        {documents.map((doc, index) => (
          <a
            key={index}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#111] border border-[#1E1E1E] hover:border-[#D4AF37]/30 transition-colors group"
          >
            <svg className="w-5 h-5 text-[#D4AF37] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <span className="text-[#F5F5F0] text-sm font-medium flex-1 group-hover:text-[#D4AF37] transition-colors">
              {doc.title}
            </span>
            <svg className="w-4 h-4 text-[#555] group-hover:text-[#D4AF37] transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
          </a>
        ))}
      </div>
    </div>
  </section>
)}
```

- [ ] **Step 4: Typecheck + build + commit + push**

```bash
pnpm typecheck
pnpm build
git add "src/app/(member)/materi/[slug]/page.tsx"
git commit -m "feat(materi): add Dokumen Tambahan section to detail page"
git push
```

---

## Verification

- [ ] Admin: form MateriDialog punya section "Dokumen Tambahan" dengan "+ Tambah Dokumen"
- [ ] Admin: bisa add/remove document rows, setiap row ada title + GDrive URL input
- [ ] Admin: simpan materi → `documents` tersimpan di Supabase
- [ ] User: halaman `/materi/{slug}` menampilkan section "DOKUMEN TAMBAHAN" kalau ada
- [ ] User: klik dokumen → buka GDrive di tab baru
- [ ] Kalau tidak ada dokumen → section tidak muncul
- [ ] `pnpm build` → success
