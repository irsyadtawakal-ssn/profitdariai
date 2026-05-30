# Dashboard Redesign — Design Spec

**Date:** 2026-05-30  
**Status:** Approved  
**Scope:** Member dashboard (`/dashboard`) + sidebar navigation + terminology rename

---

## Context

profitdariai adalah platform **library digital AI**, bukan LMS. Member membayar sekali untuk akses penuh ke koleksi materi (ebook, dan ke depannya dokumen/video). Dashboard adalah pintu masuk utama setiap login.

Dashboard lama terlalu minimal: greeting sederhana, 3 stats angka, grid kursus, grid ebook. Tidak mencerminkan nilai premium dan tidak memberi fokus yang jelas ke member.

---

## Keputusan Desain

| Aspek | Sebelum | Sesudah |
|---|---|---|
| Visual direction | Dark minimal | Dark Premium (Obsidian + Gold diperkuat) |
| Hero area | Teks greeting flat | Hero Banner dengan gold glow + quote |
| Navigasi sidebar | Dashboard · Kursus · Ebook · Marketplace · Profil | Dashboard · **Materi** · Marketplace · Profil |
| Terminologi konten | "Kursus" + "Ebook" | **"Materi"** (ebook + future: dokumen, video) |
| Seksi dashboard | Kursus Terbaru + Ebook Terbaru | **Materi Pilihan** (featured) + **Materi Terbaru** |
| Stats grid | 3 angka (Kursus, Ebook, Akses) | Terintegrasi ke hero badge |

---

## Arsitektur Halaman

```
[Sidebar] | [Main Content]
           ├── ① Hero Banner
           ├── ② Materi Pilihan (jika admin set is_featured)
           └── ③ Materi Terbaru (3 item, grid 3-kolom)
```

---

## Sections Detail

### ① Hero Banner

**Komponen:** `MemberHeader` (server component, streaming via Suspense)

**Visual:**
- Background: `linear-gradient(135deg, #161208, #0A0A0A, #100E04)` + border `#2E2800`
- Dua radial gold glow (via `::before` / `::after` pseudo-elements, `filter: blur`, `opacity: 0.12`)
- Eyebrow text: "SELAMAT DATANG KEMBALI" — uppercase, spaced, `#666`
- Nama: font display 30px, weight 900, nama member di-highlight `#D4AF37`
- Quote: italic `#555`, dirotasi dari array quotes hardcoded (tidak perlu DB)
- Badge row: badge solid gold "● MEMBER AKTIF" + separator + `{n} Materi Tersedia`

**Data yang dibutuhkan:** `full_name`, `membership_expires_at`, count materi (dari cache)

**Skeleton:** Animate-pulse placeholder untuk nama + badge selama profil query

**Quote array (contoh):**
```ts
const QUOTES = [
  "Investasi terbaik adalah investasi pada diri sendiri.",
  "Setiap hari adalah kesempatan untuk belajar sesuatu yang baru.",
  "AI bukan pengganti manusia — AI adalah alat bagi manusia yang mau belajar.",
]
// Pilih by: new Date().getDate() % QUOTES.length (deterministik per hari)
```

---

### ② Materi Pilihan (Featured)

**Komponen:** `FeaturedMateri` (server component, dari cached data)

**Kondisi render:** Hanya muncul jika ada materi dengan `is_featured = true` di tabel `ebooks`. Kalau tidak ada — seksi ini tidak render (tidak ada empty state).

**Visual:**
- Card background: `linear-gradient(135deg, #131108, #0F0D06)`, border `#2A2200`
- Left accent: `3px` solid gradient gold (`::before` pseudo-element)
- Badge kanan atas: "★ Pilihan Editor" — text only, gold
- Layout: cover thumbnail kiri (80×100px) + body kanan (tag kategori, judul, deskripsi, CTA button)
- CTA: tombol solid gold "Buka Materi →" → link ke `/materi/{slug}`
- Hover: border berubah ke `#D4AF37`

**Database change required:** Tambah kolom `is_featured BOOLEAN DEFAULT false` ke tabel `ebooks`.

---

### ③ Materi Terbaru

**Komponen:** Inline di `DashboardPage` (dari cached data)

**Data:** 3 item terbaru dari `getCachedEbooks()` (fungsi yang sudah ada, tidak perlu diubah)

**Visual:**
- Section header: "MATERI TERBARU" uppercase + "Lihat Semua →" link ke `/materi`
- Grid: `grid-template-columns: repeat(3, 1fr)`, gap 14px
- Card: rounded-xl, dark bg, hover border gold + translateY(-2px)
- Card anatomy: thumbnail (aspect-ratio 3/2) + body (kategori gold, judul bold, tipe file muted)
- Thumbnail placeholder: dark gradient dengan book icon SVG di tengah

---

## Sidebar Redesign

**Komponen:** `MemberSidebar` (client component)

**Nav items (baru):**
```ts
const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/materi', label: 'Materi', icon: BookMarked },       // ← ganti dari /ebook
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/profile', label: 'Profil', icon: User },
]
```

**Perubahan:**
- Hapus item "Kursus" (`/kursus`, `BookOpen`)
- Ganti item "Ebook" → "Materi" dengan href `/materi`
- Footer sidebar: membership pill dipertahankan

**Bottom nav mobile** (`MemberBottomNav`): Update sama — hapus Kursus, ganti Ebook → Materi.

---

## Rename: Ebook → Materi

Ini adalah **rename terminologi di UI**, bukan perubahan database. Tabel `ebooks` tetap bernama `ebooks`.

**File yang perlu diupdate:**
- `src/components/member/MemberSidebar.tsx` — nav label + href
- `src/components/member/MemberBottomNav.tsx` — nav label + href  
- `src/app/(member)/ebook/` → **route baru `/materi`** (atau redirect dari `/ebook` ke `/materi`)
- `src/app/(member)/ebook/[slug]/` → `/materi/[slug]/`
- Page titles, headings di semua halaman member yang menyebut "Ebook"
- `getCachedEbooks()` tetap nama fungsinya (internal, tidak user-facing)

**Strategi routing:** Buat route `/materi` dan `/materi/[slug]` baru. Tambahkan redirect dari `/ebook` dan `/ebook/[slug]` untuk backward compat (jika ada link lama tersimpan).

---

## Komponen Baru yang Dibuat

| Komponen | Path | Keterangan |
|---|---|---|
| `FeaturedMateri` | `src/components/member/FeaturedMateri.tsx` | Featured card dengan is_featured logic |
| `MateriCard` | `src/components/member/MateriCard.tsx` | Rename/reskin dari `EbookCard` |

`EbookCard` bisa di-rename langsung ke `MateriCard` atau dibuat baru dan `EbookCard` dihapus setelah semua referensi diganti.

---

## Database Change

```sql
-- Tambahkan kolom is_featured ke tabel ebooks
ALTER TABLE ebooks ADD COLUMN is_featured BOOLEAN DEFAULT false;

-- Set featured materi pertama (opsional seed)
-- UPDATE ebooks SET is_featured = true WHERE slug = 'nama-slug' LIMIT 1;
```

Admin CMS perlu UI toggle untuk set `is_featured`. Ini di luar scope dashboard redesign — untuk sekarang admin bisa set langsung via Supabase dashboard.

---

## Middleware Update

`src/proxy.ts` saat ini melindungi `/ebook` dan `/kursus`. Setelah rename, perlu diupdate:
- Tambah `/materi` ke protected routes
- Hapus `/kursus` dari protected routes (setelah halaman kursus dihapus)

## Cache & Performance

- `getCachedEbooks()` di `src/lib/cache/content.ts` — query Supabase perlu include field `is_featured` setelah migrasi, agar `FeaturedMateri` bisa filter tanpa query terpisah
- Filter `is_featured` dilakukan di aplikasi (bukan di DB query), sehingga tetap satu cache entry untuk semua ebooks
- `MemberHeader` tetap streaming via `<Suspense>` (user-specific data)
- Skeleton loading dipertahankan untuk hero section
- Tidak ada perubahan di `unstable_cache` strategy

---

## Out of Scope

- Hapus halaman `/kursus` dan `/kursus/[slug]` — ditangani terpisah
- Admin CMS toggle `is_featured` — bisa dilakukan via Supabase dashboard untuk sekarang
- Progress tracking / gamification — tidak relevan untuk library model
- Dark/light mode toggle — tetap dark only

---

## File yang Diubah (Summary)

```
src/
  app/(member)/
    dashboard/page.tsx          ← redesign hero + sections
    materi/page.tsx             ← baru (dari ebook/page.tsx)
    materi/[slug]/page.tsx      ← baru (dari ebook/[slug]/page.tsx)
    ebook/page.tsx              ← redirect ke /materi
    ebook/[slug]/page.tsx       ← redirect ke /materi/[slug]
  components/member/
    MemberSidebar.tsx           ← hapus Kursus, ganti Ebook→Materi
    MemberBottomNav.tsx         ← hapus Kursus, ganti Ebook→Materi
    FeaturedMateri.tsx          ← komponen baru
    MateriCard.tsx              ← rename/reskin dari EbookCard

supabase/migrations/
  004_add_is_featured.sql       ← ALTER TABLE ebooks ADD COLUMN is_featured
```
