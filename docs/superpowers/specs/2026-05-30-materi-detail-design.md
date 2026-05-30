# Materi Detail Page — Design Spec

**Date:** 2026-05-30
**Status:** Approved
**Scope:** Redesign `/materi/[slug]` detail page

---

## Context

Halaman detail materi saat ini sangat minimal: cover kiri + judul/deskripsi/download button kanan. Tidak ada video support, layout tidak mencerminkan brand premium Dark Gold.

Redesign ini menambahkan:
- Magazine layout premium
- Video support (single atau playlist jika lebih dari 1)
- Deskripsi lebih readable dalam card terpisah

---

## Design Decisions

| Aspek | Keputusan |
|---|---|
| Layout | Magazine — hero card gold-tinted, section terpisah |
| Video | JSONB array di tabel `ebooks` (bukan tabel terpisah) |
| Multi-video | Playlist: main player + daftar klik |
| Kondisi video | Section tidak render kalau `videos` null/kosong |

---

## Sections

```
① Hero Card   — cover + judul + meta + download button
② Deskripsi   — "Tentang Materi" card
③ Video       — playlist player (hanya jika ada videos)
```

---

## Section ① — Hero Card

**Visual:**
- Background: `linear-gradient(135deg, #161208, #0F0D04)`, border `#2A2200`, border-radius 16px
- Radial glow overlay: `rgba(212,175,55,0.06)` di sudut kanan atas
- Layout: flex row — cover kiri + info kanan

**Cover (kiri):**
- Width: `120px` (desktop), `80px` (mobile)
- Aspect ratio: `3/4` (portrait buku)
- Background gelap gradient kalau tidak ada cover_url
- Box shadow subtle untuk efek "buku fisik"

**Info (kanan):**
- Badge kategori — gold outlined
- Judul: `text-[22px]`, `font-black`, `tracking-tight`
- Meta row: `{page_count} halaman · PDF` — color `#555`
- Tombol **Download Materi**: solid gold `#D4AF37`, icon download, full-width di mobile

---

## Section ② — Deskripsi

**Kondisi render:** Hanya tampil jika `description` tidak null/empty.

**Visual:**
- Card: `bg-[#0E0E0E]`, border `#1A1A1A`, border-radius 12px, padding 20px 24px
- Label: "TENTANG MATERI" — uppercase, spaced, `#555`
- Teks: `text-sm` (14px), `leading-relaxed` (1.75), color `#999`

---

## Section ③ — Video Penjelasan

**Kondisi render:** Hanya tampil jika `videos` tidak null dan array tidak kosong.

**Data shape** (dari field `videos JSONB` di tabel `ebooks`):
```ts
type VideoItem = {
  title: string   // judul video, misal "Pengenalan Prompt"
  url: string     // YouTube video ID atau full URL
}
```

**Case 1 — Single video (array length = 1):**
- Langsung render YouTube iframe embed 16:9
- Caption teks judul video di bawah player

**Case 2 — Multiple videos (array length ≥ 2):**
- **Main player** di atas — embed video yang sedang aktif (default: video pertama)
- **Playlist list** di bawah player:
  - Setiap item: nomor urut + judul + indikator "Sedang diputar" untuk yang aktif
  - Item aktif: background gold/10, border gold/30, teks gold
  - Item non-aktif: background `#111`, teks `#888`
  - Klik item → ganti video di main player (client-side state)

**YouTube embed:** Gunakan `lib/youtube.ts` yang sudah ada untuk extract video ID dan generate embed URL.

**Video player UI:**
- Container: `bg-[#0E0E0E]`, border `#1E1E1E`, border-radius 8px
- Iframe: `w-full aspect-[16/9]`, `border-0`

**Playlist item component:**
```
[ ▶ ] [ Nomor · Judul Video ]  ← klik untuk play
       [ durasi atau "Sedang diputar" ]
```

---

## Database Change

```sql
-- Tambahkan kolom videos ke tabel ebooks
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT NULL;
```

**Contoh data:**
```json
[
  { "title": "Pengenalan Prompt Engineering", "url": "dQw4w9WgXcQ" },
  { "title": "Teknik Prompt Advanced", "url": "xvFZjo5PgG0" }
]
```

Admin input video via Supabase dashboard untuk sekarang (admin CMS update di luar scope ini).

---

## Komponen yang Dibuat / Diubah

| File | Action | Keterangan |
|---|---|---|
| `src/app/(member)/materi/[slug]/page.tsx` | Modify | Redesign layout, tambah videos query |
| `src/components/member/MateriVideoPlayer.tsx` | Create | Client component — playlist player dengan state aktif video |

**MateriVideoPlayer** adalah client component karena butuh state (video mana yang aktif). Terima prop `videos: VideoItem[]`. Render single embed atau playlist tergantung panjang array.

---

## Data Query

Update query di `materi/[slug]/page.tsx`:
```ts
supabase
  .from('ebooks')
  .select('id, slug, title, description, category, cover_url, page_count, videos')
  .eq('slug', slug)
  .eq('is_published', true)
  .single()
```

Tambah `videos` ke select list.

---

## Mobile Behavior

- Hero card: flex column di mobile (cover di atas, info di bawah)
- Cover: centered, max-width 160px di mobile
- Download button: full-width di mobile
- Playlist: sama — scroll vertikal

---

## Out of Scope

- Admin CMS untuk input video — input manual via Supabase dashboard untuk sekarang
- Video durasi otomatis (fetch dari YouTube API) — tampilkan judul saja
- Video thumbnail preview di playlist — pakai play icon saja
- Progress tracking / tanda sudah ditonton
