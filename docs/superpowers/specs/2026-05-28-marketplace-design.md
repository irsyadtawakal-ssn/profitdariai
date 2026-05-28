# Marketplace Feature — Design Spec

**Date:** 2026-05-28  
**Status:** Approved

---

## Overview

Fitur marketplace untuk platform profitdariai. Admin dapat mengelola produk digital (template, tools, preset, dll). Halaman member menampilkan "Coming Soon" sementara fungsionalitas admin sudah aktif. Belum ada checkout — hanya listing dengan toggle published.

---

## Database

### Tabel: `marketplace_products`

```sql
create table marketplace_products (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text,
  category      text not null,
  price         integer not null default 0,
  original_price integer,
  cover_url     text,
  product_url   text not null,
  is_published  boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
```

### RLS Policies

- `SELECT`: member aktif hanya lihat `is_published = true` (untuk fase coming soon, tidak relevan tapi disiapkan)
- `INSERT / UPDATE / DELETE`: admin only (via `service_role` dari server actions)

---

## Admin Panel

### Route: `/admin/marketplace`

**File structure** (mengikuti pola `/admin/ebook`):

```
src/app/(admin)/admin/marketplace/
  page.tsx              — RSC: fetch semua produk, render MarketplaceClient
  MarketplaceClient.tsx — 'use client': tabel list + tombol + toggle
  MarketplaceDialog.tsx — modal form add/edit
  actions.ts            — 'use server': createProduct, updateProduct, deleteProduct
```

### MarketplaceDialog — Form fields

| Field | Input | Validasi |
|---|---|---|
| Nama Produk | text | required |
| Slug | text | required, auto-generate dari title |
| Kategori | text | required (contoh: Template, Tools, Preset) |
| Harga (IDR) | number | required, min 0 |
| Harga Normal (coret) | number | optional — jika diisi tampil sebagai harga coret |
| Cover URL | text | optional |
| Link Produk | text | required (GDrive/URL) |
| Published | toggle/select | default false |

### Admin Sidebar

Tambah nav item "Marketplace" dengan icon `ShoppingBag` di `AdminSidebar.tsx`.

---

## Member Area

### Route: `/marketplace`

Halaman statis "Coming Soon":
- Heading: "Marketplace"
- Subtext: "Segera hadir — produk digital pilihan untuk memaksimalkan profit kamu dari AI."
- Badge: "Coming Soon"
- Tidak ada fetch data, tidak ada koneksi ke tabel produk

### Navigation

Tambah "Marketplace" di:
- `MemberSidebar.tsx` — icon `ShoppingBag`, link `/marketplace`
- `MemberBottomNav.tsx` — icon `ShoppingBag`, link `/marketplace`

---

## Migration

File: `supabase/migrations/004_marketplace.sql`

Berisi:
1. `CREATE TABLE marketplace_products`
2. RLS enable
3. RLS policies

---

## TypeScript Types

Tambah tipe `marketplace_products` ke `src/types/database.ts` (Row, Insert, Update).

---

## Out of Scope (fase ini)

- Checkout / pembayaran produk marketplace
- Review / rating produk
- Kategori produk tersendiri (pakai text field biasa)
- File upload — pakai URL eksternal (GDrive, dll) sama seperti ebook
