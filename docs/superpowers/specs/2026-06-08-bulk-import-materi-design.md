# Bulk Import CSV — Admin Materi

**Date:** 2026-06-08  
**Status:** Approved  
**Scope:** Admin panel `/admin/materi`

---

## Overview

Tambahkan fitur bulk import via CSV ke halaman Admin Materi, sehingga admin bisa menambahkan banyak materi sekaligus tanpa perlu klik "+ Tambah" satu per satu.

---

## User Flow

1. Admin membuka `/admin/materi`
2. Klik tombol **"Import CSV"** (di samping tombol "+ Tambah")
3. Dialog terbuka — ada tombol **"Download Template"** untuk download CSV contoh
4. Admin upload file CSV yang sudah diisi
5. Sistem parse CSV di client → tampilkan **preview tabel**
   - Baris valid → highlight hijau
   - Baris error → highlight merah dengan pesan error inline
6. Admin klik **"Import Sekarang"** → hanya baris valid yang dikirim
7. Server action batch insert ke DB
8. Dialog tampilkan hasil: `✓ 12 berhasil, ✗ 2 gagal (baris 4, 7)`

---

## Format CSV

Kolom wajib dan opsional:

| Kolom | Wajib | Keterangan |
|-------|-------|-----------|
| `title` | ✅ | Judul materi |
| `slug` | ❌ | Auto-generate dari title jika kosong |
| `category` | ✅ | Bisnis / Freelancing / Konten / Otomasi / Prompt / Lainnya |
| `description` | ❌ | Deskripsi singkat |
| `file_path` | ✅ | Google Drive URL — auto-convert ke direct download |
| `cover_url` | ❌ | URL gambar cover langsung |
| `page_count` | ❌ | Angka integer |
| `is_featured` | ❌ | `true` / `false` — default `false` |
| `is_published` | ❌ | `true` / `false` — default `false` |

---

## Komponen & Files

### `BulkImportDialog.tsx` (client component baru)
- State: `file`, `rows` (parsed), `status` (`idle` | `preview` | `importing` | `done`)
- Parse CSV di client menggunakan native string split (tidak perlu library)
- Validasi per baris: wajib fields, kategori enum, GDrive URL format
- Tampilkan preview tabel scrollable dengan badge valid/error per baris
- Tombol "Download Template" → generate dan download CSV template via Blob

### `MateriClient.tsx` (update)
- Tambah tombol "Import CSV" di header, klik buka `BulkImportDialog`

### `actions.ts` (update)
- Tambah `bulkImportMateri(rows: ValidRow[])` server action
- Loop insert per baris (bukan batch SQL) untuk error isolation
- Return `{ success: number, errors: { row: number, message: string }[] }`
- Revalidate `/admin/materi`, `/materi`, `/dashboard` setelah selesai

---

## Validasi Rules

| Rule | Behavior |
|------|----------|
| `title` kosong | Error: "Judul wajib diisi" |
| `category` tidak valid | Error: "Kategori tidak dikenali" |
| `file_path` bukan GDrive URL | Error: "Link GDrive tidak valid" |
| `slug` kosong | Auto-generate: `title.toLowerCase().replace(spaces, '-').removeSpecialChars()` |
| Baris seluruhnya kosong | Skip tanpa error |
| Lebih dari 100 baris | Error global: "Maksimal 100 baris per import" |

---

## UI States

- **idle** — form upload + tombol download template
- **preview** — tabel hasil parse, tombol "Import Sekarang" (disabled jika 0 baris valid)
- **importing** — spinner, tombol disabled
- **done** — summary sukses/gagal, tombol "Tutup"

---

## Constraints

- Tidak perlu library CSV parser — pakai native string split
- Template CSV di-embed sebagai string constant (tidak perlu API endpoint baru)
- Max 100 baris per sekali import
- Import bersifat additive only — tidak ada update/upsert
- Slug collision diabaikan (DB akan reject, muncul di error list)
