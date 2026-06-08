# Marketplace Product Detail Page — Design Spec

**Date:** 2026-06-08
**Status:** Approved

## Overview

Saat ini klik pada card produk di marketplace tidak mengarah kemana-mana. Fitur ini menambahkan halaman detail produk (`/marketplace/[slug]`) yang menampilkan cover, deskripsi lengkap, dan poin-poin konten produk (jumlah dokumen, video, dll). Checkout modal tetap ada di halaman detail.

## Database

Tambah kolom `features JSONB DEFAULT '[]'` di tabel `marketplace_products`.

Format data: array of strings.
```json
["10 dokumen PDF", "5 video tutorial", "Template Notion gratis", "Akses seumur hidup"]
```

Migration file: `supabase/migrations/006_marketplace_features.sql`

```sql
ALTER TABLE marketplace_products ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';
```

## Routing

- **Grid card** di `/marketplace` → link ke `/marketplace/[slug]` (bukan tombol checkout langsung)
- **New page:** `src/app/(member)/marketplace/[slug]/page.tsx`
  - Fetch produk by slug via admin client
  - Pass ke `MarketplaceProductDetail` client component
- **Tombol Beli** di halaman detail → buka `CheckoutModal` (dipindah ke component terpisah)

## Halaman Detail (`/marketplace/[slug]`)

Layout dari atas ke bawah:

1. **Back link** — `← Kembali ke Marketplace`
2. **Cover image** — full width, aspect-ratio 4/3, max-width 600px, centered
3. **Category badge** + **Title** (font-display, bold, besar)
4. **Harga** (gold) + harga coret jika ada `original_price`
5. **Deskripsi** — teks lengkap (tidak di-clamp seperti di card)
6. **Section "Apa yang Kamu Dapat"** — list `features` dengan ikon `CheckCircle` per item
7. **CTA Button:**
   - Jika `isOwned` → "Buka di Library" (link ke `/materi`)
   - Jika punya `ebook_id` → "Beli Sekarang" (buka CheckoutModal)
   - Jika tidak ada `ebook_id` → "Segera Hadir" (disabled)

Styling: konsisten dengan brand (Obsidian `#0A0A0A`, Gold `#D4AF37`, Ivory `#F5F5F0`), font-display untuk heading, font-mono untuk label/badge.

## Perubahan di MarketplaceClient

- Card tidak lagi punya tombol "Beli Sekarang" inline — seluruh card jadi link ke `/marketplace/[slug]`
- `CheckoutModal` dipindah ke file terpisah `src/components/member/CheckoutModal.tsx` agar bisa dipakai di halaman detail
- State `checkoutProduct` dan logika modal dipindah ke `MarketplaceProductDetail`

## Admin Form (`MarketplaceDialog.tsx`)

Tambah field `features` — input dinamis:
- List input fields (satu per poin)
- Tombol "+ Tambah Poin" untuk tambah baris baru
- Tombol "×" per baris untuk hapus
- Nilai disimpan sebagai JSON array ke kolom `features`

## Files yang Diubah / Dibuat

| File | Action |
|---|---|
| `supabase/migrations/006_marketplace_features.sql` | CREATE |
| `src/app/(member)/marketplace/[slug]/page.tsx` | CREATE |
| `src/components/member/MarketplaceProductDetail.tsx` | CREATE |
| `src/components/member/CheckoutModal.tsx` | CREATE (extracted) |
| `src/components/member/MarketplaceClient.tsx` | MODIFY (card jadi link, hapus CheckoutModal inline) |
| `src/app/(admin)/admin/marketplace/MarketplaceDialog.tsx` | MODIFY (tambah features field) |
| `src/app/(admin)/admin/marketplace/actions.ts` | MODIFY (include features di insert/update) |

## Out of Scope

- Halaman detail untuk produk yang belum punya slug (tampilkan 404)
- Animasi transisi halaman
- Review/rating produk
