# Fitur Landing Pages (Admin) — Design Spec

**Tanggal:** 2026-06-13
**Status:** Approved (brainstorming)

## Tujuan

Memberi admin kemampuan membuat landing page baru dengan cara **paste kode HTML standalone buatan sendiri**. Sistem menyimpan HTML dan menyajikannya di route publik `/lp/{slug}`. Tiap landing page adalah satu dokumen HTML penuh yang berdiri sendiri (punya `<html>`, `<head>`, `<style>`, `<script>` sendiri).

Contoh sumber: `landing-page-cuan-dari-ai (3).html` — HTML utuh ~56KB, Google Fonts eksternal, 2 `<script>`, CTA ke `lynk.id`.

## Non-Goals (YAGNI)

- Bukan template builder / form-based.
- Bukan drag-and-drop / section blocks.
- Tidak ada auto-inject checkout internal — admin atur link CTA sendiri di dalam HTML.
- Tidak ada auto-inject Meta Pixel — kalau perlu tracking, admin tempel manual di HTML.

## Arsitektur

### 1. Database — tabel `landing_pages`

Supabase migration baru di `supabase/migrations/`.

| kolom | tipe | keterangan |
|---|---|---|
| `id` | uuid PK default `gen_random_uuid()` | |
| `slug` | text UNIQUE NOT NULL | URL publik `/lp/{slug}` |
| `title` | text NOT NULL | judul internal untuk admin |
| `html` | text NOT NULL | kode HTML penuh yang di-paste |
| `published` | boolean NOT NULL default false | draft vs live |
| `created_at` | timestamptz default now() | |
| `updated_at` | timestamptz default now() | trigger auto-update |

**RLS:**
- Write (insert/update/delete): hanya role `admin`.
- Read publik: hanya baris `published = true`. (Admin baca semua via service_role / admin client.)

### 2. Route publik — `src/app/(marketing)/lp/[slug]/route.ts`

Route Handler (bukan page component). Alur:
1. Ambil baris by `slug` (read publik, hanya `published = true`).
2. Jika ditemukan → `new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })`.
3. Jika tidak ada / draft → return 404.

Pendekatan ini (Approach A) men-serve HTML **apa adanya** dan bypass React tree Next.js, sehingga `<html>/<head>/<style>/<script>` jalan persis seperti file asli tanpa konflik styling layout.

Catatan: route diletakkan di luar layout marketing yang menambah chrome, atau gunakan route group yang tidak membungkus chrome — Route Handler tidak memakai layout React jadi aman.

### 3. Admin CRUD — `src/app/(admin)/admin/landing/`

Mengikuti pola existing (`kursus`, `materi`, `marketplace`):

- **`page.tsx`** — Server component. List semua landing page (title, slug, status published/draft, link "Lihat" ke `/lp/{slug}`). Panggil `requireAdmin()`.
- **`actions.ts`** — Server actions, semua dipagari `requireAdmin()` di baris pertama:
  - `createLandingPage({ title, slug, html, published })`
  - `updateLandingPage(id, { ... })`
  - `deleteLandingPage(id)`
  - `togglePublish(id, published)`
- **`LandingClient.tsx`** — Client component. Tabel daftar + tombol Tambah/Edit/Hapus + toggle publish.
- **`LandingDialog.tsx`** — Form dialog: `title`, `slug` (auto-generate dari title saat diketik, bisa di-edit manual), textarea besar untuk paste HTML, toggle `published`.

### 4. Sidebar

Tambah item menu **"Landing Pages"** di `src/components/admin/AdminSidebar.tsx`, mengarah ke `/admin/landing`.

## Validasi

- **Slug:** regex `^[a-z0-9]+(?:-[a-z0-9]+)*$` (huruf kecil, angka, strip). Unik (enforced DB unique + cek di action dengan pesan error ramah). Hindari bentrok dengan route reserved (mis. `lp` sendiri tidak relevan karena slug ada di bawah `/lp/`).
- **HTML:** wajib non-kosong. Tidak ada sanitasi — admin adalah pihak tepercaya, raw HTML sengaja diizinkan.
- **Title:** wajib non-kosong.

## Workflow Admin

1. Buat/edit HTML landing page di luar (atur link CTA checkout di dalam HTML).
2. Admin → menu "Landing Pages" → "Tambah Landing Page".
3. Paste HTML, isi title, slug auto/manual, set published.
4. Simpan → akses di `https://profitdariai.com/lp/{slug}`.

## Testing

- Action `createLandingPage` menolak non-admin.
- Slug invalid / duplikat → error jelas, tidak tersimpan.
- Route `/lp/{slug}` published → 200 + `text/html`, isi identik HTML tersimpan.
- Route `/lp/{slug}` draft / tidak ada → 404.
- Toggle publish mengubah aksesibilitas publik.
