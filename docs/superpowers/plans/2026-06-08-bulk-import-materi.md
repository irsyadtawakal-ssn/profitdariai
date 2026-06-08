# Bulk Import CSV — Admin Materi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambahkan fitur bulk import CSV ke halaman admin `/admin/materi` agar admin bisa menambahkan banyak materi sekaligus.

**Architecture:** Satu client component baru `BulkImportDialog.tsx` menangani seluruh flow (upload → parse → preview → import). Server action `bulkImportMateri` di `actions.ts` menerima array row valid dan insert ke DB satu per satu untuk error isolation. `MateriClient.tsx` ditambah tombol "Import CSV" yang membuka dialog.

**Tech Stack:** Next.js 16 App Router, React `useTransition`, native CSV parsing (no library), Supabase admin client, Tailwind CSS (brand colors `#0A0A0A`, `#D4AF37`, `#F5F5F0`)

---

## File Map

| File | Action | Keterangan |
|------|--------|-----------|
| `src/app/(admin)/admin/materi/BulkImportDialog.tsx` | **Create** | Client component — seluruh UI bulk import |
| `src/app/(admin)/admin/materi/actions.ts` | **Modify** | Tambah `bulkImportMateri` server action |
| `src/app/(admin)/admin/materi/MateriClient.tsx` | **Modify** | Tambah tombol "Import CSV" + import BulkImportDialog |
| `src/test/components/admin/BulkImportDialog.test.tsx` | **Create** | Unit tests |

---

## Task 1: Server Action `bulkImportMateri`

**Files:**
- Modify: `src/app/(admin)/admin/materi/actions.ts`
- Create: `src/test/components/admin/BulkImportDialog.test.tsx` (test file disiapkan)

### Tipe data yang digunakan

```typescript
export interface ImportRow {
  title: string
  slug: string           // sudah di-slugify sebelum dikirim
  category: string
  description: string | null
  file_path: string      // sudah di-convert dari GDrive URL
  cover_url: string | null
  page_count: number | null
  is_featured: boolean
  is_published: boolean
}

export interface ImportResult {
  success: number
  errors: { row: number; message: string }[]
}
```

- [ ] **Step 1: Tambah tipe + server action ke `actions.ts`**

Tambahkan di bawah `deleteEbook`:

```typescript
export interface ImportRow {
  title: string
  slug: string
  category: string
  description: string | null
  file_path: string
  cover_url: string | null
  page_count: number | null
  is_featured: boolean
  is_published: boolean
}

export interface ImportResult {
  success: number
  errors: { row: number; message: string }[]
}

export async function bulkImportMateri(rows: ImportRow[]): Promise<ImportResult> {
  await requireAdmin()
  const supabase = createAdminClient()
  let success = 0
  const errors: { row: number; message: string }[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('ebooks').insert({
      title: row.title,
      slug: row.slug,
      category: row.category,
      description: row.description,
      file_path: row.file_path,
      cover_url: row.cover_url,
      page_count: row.page_count,
      is_featured: row.is_featured,
      is_published: row.is_published,
      videos: null,
      documents: null,
    })
    if (error) {
      errors.push({ row: i + 2, message: error.message }) // +2: header row + 1-index
    } else {
      success++
    }
  }

  revalidatePath('/admin/materi')
  revalidatePath('/materi')
  revalidatePath('/dashboard')

  return { success, errors }
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(admin)/admin/materi/actions.ts"
git commit -m "feat(admin): add bulkImportMateri server action"
```

---

## Task 2: CSV Parser + Validator (pure functions, mudah di-test)

**Files:**
- Create: `src/app/(admin)/admin/materi/BulkImportDialog.tsx` (skeleton dulu)
- Create: `src/test/components/admin/BulkImportDialog.test.tsx`

Parser dan validator ditulis sebagai pure functions yang di-export dari dialog file, sehingga bisa di-test tanpa render.

### Fungsi yang akan dibuat

```typescript
// Slugify
function slugify(str: string): string

// Parse GDrive URL (sama seperti MateriDialog)
function parseGdriveUrl(input: string): string | null

// Parse satu baris CSV (handle quoted fields)
function parseCsvLine(line: string): string[]

// Validasi + transform satu baris parsed CSV
function validateRow(
  cells: string[],
  headers: string[],
  rowIndex: number  // 1-based, untuk display error
): { valid: true; data: ImportRow } | { valid: false; error: string }
```

- [ ] **Step 1: Buat `BulkImportDialog.tsx` dengan pure functions saja (belum ada React)**

```typescript
'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { bulkImportMateri, ImportRow, ImportResult } from './actions'

const VALID_CATEGORIES = ['Bisnis', 'Freelancing', 'Konten', 'Otomasi', 'Prompt', 'Lainnya'] as const

const CSV_TEMPLATE = `title,slug,category,description,file_path,cover_url,page_count,is_featured,is_published
Panduan Prompt AI,panduan-prompt-ai,Prompt,Deskripsi singkat materi,https://drive.google.com/file/d/FILE_ID/view,,50,false,false
Bisnis Digital dengan AI,,Bisnis,,https://drive.google.com/file/d/FILE_ID2/view,https://example.com/cover.jpg,80,false,true`

function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function parseGdriveUrl(input: string): string | null {
  const trimmed = input.trim()
  const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`
  const openMatch = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/)
  if (openMatch) return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`
  if (trimmed.includes('drive.google.com/uc') && trimmed.includes('export=download')) return trimmed
  return null
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function validateRow(
  cells: string[],
  headers: string[],
  rowIndex: number
): { valid: true; data: ImportRow } | { valid: false; error: string } {
  const get = (col: string) => cells[headers.indexOf(col)]?.trim() ?? ''

  const title = get('title')
  if (!title) return { valid: false, error: `Baris ${rowIndex}: Judul wajib diisi` }

  const category = get('category')
  if (!VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    return { valid: false, error: `Baris ${rowIndex}: Kategori "${category}" tidak dikenali` }
  }

  const rawFilePath = get('file_path')
  const filePath = parseGdriveUrl(rawFilePath)
  if (!filePath) return { valid: false, error: `Baris ${rowIndex}: Link GDrive tidak valid` }

  const rawSlug = get('slug')
  const slug = rawSlug || slugify(title)

  const pageCountRaw = get('page_count')
  const pageCount = pageCountRaw ? Number(pageCountRaw) : null
  if (pageCountRaw && isNaN(Number(pageCountRaw))) {
    return { valid: false, error: `Baris ${rowIndex}: Jumlah halaman harus angka` }
  }

  return {
    valid: true,
    data: {
      title,
      slug,
      category,
      description: get('description') || null,
      file_path: filePath,
      cover_url: get('cover_url') || null,
      page_count: pageCount,
      is_featured: get('is_featured') === 'true',
      is_published: get('is_published') === 'true',
    },
  }
}

export function parseCsv(text: string): {
  rows: ({ valid: true; data: ImportRow } | { valid: false; error: string })[]
  globalError: string | null
} {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  if (lines.length < 2) return { rows: [], globalError: 'File CSV kosong atau hanya berisi header' }

  const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim())
  const dataLines = lines.slice(1)

  if (dataLines.length > 100) {
    return { rows: [], globalError: 'Maksimal 100 baris per import' }
  }

  const rows = dataLines.map((line, i) => {
    const cells = parseCsvLine(line)
    // skip baris kosong (semua cell kosong)
    if (cells.every(c => !c)) return null
    return validateRow(cells, headers, i + 2)
  }).filter(Boolean) as ({ valid: true; data: ImportRow } | { valid: false; error: string })[]

  return { rows, globalError: null }
}

// Placeholder component — akan diisi di Task 3
export function BulkImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return null
}
```

- [ ] **Step 2: Tulis test untuk pure functions**

Buat `src/test/components/admin/BulkImportDialog.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { parseCsv } from '@/app/(admin)/admin/materi/BulkImportDialog'

const VALID_CSV = `title,slug,category,description,file_path,cover_url,page_count,is_featured,is_published
Panduan Prompt AI,panduan-prompt-ai,Prompt,Deskripsi,https://drive.google.com/file/d/abc123/view,,50,false,false
Bisnis Digital,,Bisnis,,https://drive.google.com/file/d/def456/view,,, false,true`

describe('parseCsv', () => {
  it('returns rows for valid CSV', () => {
    const { rows, globalError } = parseCsv(VALID_CSV)
    expect(globalError).toBeNull()
    expect(rows).toHaveLength(2)
    expect(rows[0].valid).toBe(true)
    if (rows[0].valid) {
      expect(rows[0].data.title).toBe('Panduan Prompt AI')
      expect(rows[0].data.slug).toBe('panduan-prompt-ai')
      expect(rows[0].data.file_path).toBe('https://drive.google.com/uc?export=download&id=abc123')
      expect(rows[0].data.page_count).toBe(50)
      expect(rows[0].data.is_featured).toBe(false)
    }
  })

  it('auto-generates slug from title when slug is empty', () => {
    const { rows } = parseCsv(VALID_CSV)
    expect(rows[1].valid).toBe(true)
    if (rows[1].valid) {
      expect(rows[1].data.slug).toBe('bisnis-digital')
    }
  })

  it('returns error for invalid category', () => {
    const csv = `title,slug,category,description,file_path,cover_url,page_count,is_featured,is_published
Test,,InvalidCat,,https://drive.google.com/file/d/abc/view,,,false,false`
    const { rows } = parseCsv(csv)
    expect(rows[0].valid).toBe(false)
    if (!rows[0].valid) {
      expect(rows[0].error).toMatch(/Kategori/)
    }
  })

  it('returns error for invalid GDrive URL', () => {
    const csv = `title,slug,category,description,file_path,cover_url,page_count,is_featured,is_published
Test,,Bisnis,,https://example.com/not-gdrive,,,false,false`
    const { rows } = parseCsv(csv)
    expect(rows[0].valid).toBe(false)
    if (!rows[0].valid) {
      expect(rows[0].error).toMatch(/GDrive/)
    }
  })

  it('returns error for missing title', () => {
    const csv = `title,slug,category,description,file_path,cover_url,page_count,is_featured,is_published
,,Bisnis,,https://drive.google.com/file/d/abc/view,,,false,false`
    const { rows } = parseCsv(csv)
    expect(rows[0].valid).toBe(false)
    if (!rows[0].valid) {
      expect(rows[0].error).toMatch(/Judul/)
    }
  })

  it('returns globalError for CSV with more than 100 data rows', () => {
    const header = 'title,slug,category,description,file_path,cover_url,page_count,is_featured,is_published'
    const row = 'Test,,Bisnis,,https://drive.google.com/file/d/abc/view,,,false,false'
    const csv = [header, ...Array(101).fill(row)].join('\n')
    const { globalError } = parseCsv(csv)
    expect(globalError).toMatch(/100/)
  })

  it('skips fully empty rows', () => {
    const csv = `title,slug,category,description,file_path,cover_url,page_count,is_featured,is_published
Panduan,,Bisnis,,https://drive.google.com/file/d/abc/view,,,false,false
,,,,,,,, 
Test2,,Prompt,,https://drive.google.com/file/d/def/view,,,false,false`
    const { rows } = parseCsv(csv)
    expect(rows).toHaveLength(2)
  })

  it('returns globalError for empty CSV', () => {
    const { globalError } = parseCsv('title,category\n')
    expect(globalError).toBeTruthy()
  })
})
```

- [ ] **Step 3: Run test — pastikan pass**

```bash
pnpm test run -- src/test/components/admin/BulkImportDialog.test.tsx
```

Expected: semua test PASS.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(admin)/admin/materi/BulkImportDialog.tsx"
git add "src/test/components/admin/BulkImportDialog.test.tsx"
git commit -m "feat(admin): add CSV parser + validator for bulk import"
```

---

## Task 3: `BulkImportDialog` UI Component

**Files:**
- Modify: `src/app/(admin)/admin/materi/BulkImportDialog.tsx` — ganti placeholder dengan UI lengkap

- [ ] **Step 1: Ganti isi `BulkImportDialog` component (jaga pure functions di atas tetap sama)**

Ganti hanya fungsi `BulkImportDialog` di bawah (pure functions dan `parseCsv` di atas TIDAK diubah):

```typescript
type ParsedRow = { valid: true; data: ImportRow } | { valid: false; error: string }
type Status = 'idle' | 'preview' | 'importing' | 'done'

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'template-bulk-import-materi.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function BulkImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<Status>('idle')
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleClose() {
    setStatus('idle')
    setRows([])
    setGlobalError(null)
    setResult(null)
    onClose()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const parsed = parseCsv(text)
      setGlobalError(parsed.globalError)
      setRows(parsed.rows)
      setStatus('preview')
    }
    reader.readAsText(file)
  }

  function handleImport() {
    const validRows = rows.filter(r => r.valid).map(r => (r as { valid: true; data: ImportRow }).data)
    if (validRows.length === 0) return
    setStatus('importing')
    startTransition(async () => {
      const res = await bulkImportMateri(validRows)
      setResult(res)
      setStatus('done')
    })
  }

  const validCount = rows.filter(r => r.valid).length
  const errorCount = rows.filter(r => !r.valid).length

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#F5F5F0]">Import CSV Materi</DialogTitle>
        </DialogHeader>

        {/* IDLE */}
        {status === 'idle' && (
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-sm text-[#888888]">
              Upload file CSV untuk menambahkan banyak materi sekaligus. Maks. 100 baris per import.
            </p>
            <button
              type="button"
              onClick={downloadTemplate}
              className="text-sm text-[#D4AF37] hover:underline text-left"
            >
              ↓ Download Template CSV
            </button>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#F5F5F0]">Upload File CSV</label>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="text-sm text-[#888888] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#222222] file:text-[#F5F5F0] file:text-xs file:cursor-pointer hover:file:bg-[#2A2A2A]"
              />
            </div>
          </div>
        )}

        {/* PREVIEW */}
        {status === 'preview' && (
          <div className="flex flex-col gap-4 mt-2">
            {globalError && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">
                {globalError}
              </p>
            )}
            {!globalError && (
              <>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-400">✓ {validCount} baris valid</span>
                  {errorCount > 0 && <span className="text-red-400">✗ {errorCount} baris error</span>}
                </div>
                <div className="overflow-x-auto border border-[#222] rounded-lg max-h-64 overflow-y-auto">
                  <table className="w-full text-xs min-w-[500px]">
                    <thead className="sticky top-0 bg-[#111]">
                      <tr className="border-b border-[#222]">
                        {['#', 'Status', 'Judul', 'Kategori', 'Slug'].map(h => (
                          <th key={h} className="text-left px-3 py-2 text-[#555] font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i} className={`border-b border-[#1a1a1a] last:border-0 ${row.valid ? '' : 'bg-red-950/20'}`}>
                          <td className="px-3 py-2 text-[#555]">{i + 2}</td>
                          <td className="px-3 py-2">
                            {row.valid
                              ? <span className="text-green-400 text-[10px] font-bold">✓ Valid</span>
                              : <span className="text-red-400 text-[10px] font-bold">✗ Error</span>
                            }
                          </td>
                          <td className="px-3 py-2 text-[#F5F5F0] max-w-[160px] truncate">
                            {row.valid ? row.data.title : <span className="text-red-400 text-[10px]">{row.error}</span>}
                          </td>
                          <td className="px-3 py-2 text-[#888]">{row.valid ? row.data.category : '—'}</td>
                          <td className="px-3 py-2 text-[#888] max-w-[120px] truncate">{row.valid ? row.data.slug : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-2 justify-between items-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setStatus('idle'); setRows([]); setGlobalError(null) }}
                    className="text-xs text-[#888] hover:text-[#F5F5F0]"
                  >
                    ← Ganti file
                  </button>
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={handleClose}>Batal</Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleImport}
                      disabled={validCount === 0}
                    >
                      Import {validCount} Materi
                    </Button>
                  </div>
                </div>
              </>
            )}
            {globalError && (
              <div className="flex justify-end">
                <Button type="button" variant="secondary" size="sm" onClick={() => { setStatus('idle'); setGlobalError(null) }}>
                  Coba Lagi
                </Button>
              </div>
            )}
          </div>
        )}

        {/* IMPORTING */}
        {status === 'importing' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#888]">Mengimport {validCount} materi...</p>
          </div>
        )}

        {/* DONE */}
        {status === 'done' && result && (
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-2">
              {result.success > 0 && (
                <p className="text-sm text-green-400">✓ {result.success} materi berhasil diimport</p>
              )}
              {result.errors.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-red-400">✗ {result.errors.length} gagal:</p>
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-xs text-[#888] pl-3">Baris {e.row}: {e.message}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="primary" size="sm" onClick={handleClose}>Tutup</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Run tests — pastikan pure function tests tetap pass**

```bash
pnpm test run -- src/test/components/admin/BulkImportDialog.test.tsx
```

Expected: semua PASS (pure functions tidak berubah).

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(admin)/admin/materi/BulkImportDialog.tsx"
git commit -m "feat(admin): add BulkImportDialog UI component"
```

---

## Task 4: Integrasi ke `MateriClient.tsx`

**Files:**
- Modify: `src/app/(admin)/admin/materi/MateriClient.tsx`

- [ ] **Step 1: Tambah import + state + tombol di `MateriClient.tsx`**

Tambah import di baris atas:
```typescript
import { BulkImportDialog } from './BulkImportDialog'
```

Tambah state di dalam fungsi `MateriClient` (setelah `const [editTarget, ...]`):
```typescript
const [importOpen, setImportOpen] = useState(false)
```

Ganti header section:
```typescript
<div className="flex items-center justify-between mb-6">
  <h1 className="text-2xl font-bold text-[#F5F5F0]">Materi</h1>
  <div className="flex gap-2">
    <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>Import CSV</Button>
    <Button variant="primary" size="sm" onClick={openAdd}>+ Tambah</Button>
  </div>
</div>
```

Tambah dialog di bawah `<MateriDialog .../>`:
```typescript
<BulkImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Run semua tests**

```bash
pnpm test run
```

Expected: 64+ tests PASS, 0 FAIL.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(admin)/admin/materi/MateriClient.tsx"
git commit -m "feat(admin): integrate BulkImportDialog into MateriClient"
```

---

## Task 5: Manual Smoke Test

- [ ] **Step 1: Jalankan dev server**

```bash
pnpm dev
```

Buka `http://localhost:3000/admin/materi`

- [ ] **Step 2: Test happy path**

1. Klik "Import CSV" → dialog terbuka ✓
2. Klik "↓ Download Template CSV" → file `template-bulk-import-materi.csv` terdownload ✓
3. Buka template → isi 2-3 baris dengan data valid → save
4. Upload file → preview tabel muncul, baris hijau ✓
5. Klik "Import N Materi" → spinner muncul → done state menampilkan "✓ N materi berhasil" ✓
6. Tutup dialog → materi baru muncul di tabel ✓

- [ ] **Step 3: Test error path**

1. Buat CSV dengan 1 baris kategori invalid (`category = "Salah"`)
2. Upload → preview menampilkan baris merah dengan pesan error ✓
3. Tombol "Import" masih aktif jika ada baris valid lain ✓
4. Tombol "Import" disabled jika semua baris error ✓

- [ ] **Step 4: Test edge cases**

1. Upload CSV kosong (hanya header) → globalError "File CSV kosong" ✓
2. Upload non-CSV → browser filter, tidak bisa dipilih ✓

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat(admin): bulk import CSV materi — complete"
```
