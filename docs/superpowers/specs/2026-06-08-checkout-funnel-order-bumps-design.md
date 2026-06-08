# Design: Checkout Funnel + 2 Order Bump

**Tanggal:** 2026-06-08
**Status:** Approved (brainstorm)

## Tujuan

Mengubah harga landing dan merombak checkout dari satu halaman menjadi **funnel 3-step** dengan 2 order bump (VIP konsultasi WhatsApp + bonus produk digital) sebelum pembayaran, untuk menaikkan nilai transaksi rata-rata.

## Keputusan Brainstorm

- **Struktur step:** Wizard 1-route (`/checkout`), tampil bertahap dengan transisi. State di React (anti-hilang saat back/refresh dalam sesi step).
- **Fulfillment VIP:** Flag `is_vip` di profil + admin follow-up manual via WhatsApp.
- **Bump produk digital:** Admin pilih 1 ebook + set harga promo (pola seperti `is_featured`).
- **YAGNI (tidak dikerjakan):** Halaman OTO setelah bayar, countdown timer, multi-tier VIP.

## 1. Perubahan Harga

- `MEMBERSHIP_EARLY_BIRD_PRICE`: `199_000` → **`99_000`** (harga riil yang ditagih).
- Tambah konstanta `VIP_UPSELL_PRICE = 50_000` di `src/types/index.ts`.
- Landing page (`src/app/(marketing)/page.tsx`):
  - Pricing card: harga lama **Rp 199.000 dicoret**, harga baru **Rp 99.000**.
  - Semua copy "199.000"/"199K" (topbar baris 62-63, tombol baris 336 & 382, FAQ baris 360) → "99.000"/"99K".
- Checkout page subtitle (`src/app/(checkout)/checkout/page.tsx`) → "Rp 99.000".

## 2. Arsitektur Funnel — Wizard 1-Route

`/checkout` jadi wizard 3 step dengan transisi slide + progress indicator ("Langkah X dari 3"):

```
Step 1: Penawaran VIP   → toggle +50rb  → [Lanjutkan →] / [Lanjut tanpa VIP]
Step 2: Penawaran Bonus → toggle bonus  → [Lanjut ke Pembayaran →] / [Lewati]
Step 3: Data + Bayar    → form (nama, email) + metode bayar + ringkasan + [Bayar Sekarang]
```

- State funnel (`vipSelected`, `bonusSelected`, `step`) dikelola di komponen client `CheckoutForm` (atau wrapper baru `CheckoutWizard`).
- Tiap bump pakai pola **order-bump card** (toggle/checkbox) → total update live, user bisa berubah pikiran.
- Data pembeli (nama, email) + pilihan metode pembayaran tetap di Step 3 (seperti sekarang).

## 3. Bump VIP (+Rp 50.000 — Konsultasi WhatsApp Eksklusif)

- **DB:** migration `20260608_add_is_vip.sql`:
  ```sql
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;
  ```
- **Checkout:** kalau dipilih → `+VIP_UPSELL_PRICE` ke subtotal; kirim flag `vip: true` ke `/api/payment/create`; simpan di `transactions.metadata.vip`.
- **Webhook** (`src/app/api/payment/webhook/route.ts`): saat status `PAID` dan `metadata.vip === true` → `UPDATE profiles SET is_vip = true WHERE id = userId`.
- **Admin** (`src/app/(admin)/admin/members/page.tsx`): tampilkan badge "VIP" pada member dengan `is_vip = true` agar admin tahu siapa yang di-follow-up via WhatsApp.
- Email sukses tetap pakai template existing (tidak ada perubahan email).

## 4. Bump Bonus (Produk Digital — Harga Miring)

- **DB:** migration `20260608_add_bump_product.sql`:
  ```sql
  ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS is_bump_product BOOLEAN DEFAULT false;
  ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS bump_price INTEGER;
  ```
- **Admin** (`MateriDialog.tsx` + server action): checkbox "Jadikan Produk Bump Checkout" + input "Harga Bump (IDR)". Idealnya hanya 1 ebook aktif (konvensi, sama seperti `is_featured`).
- **Checkout:** server fetch ebook `is_bump_product = true` (via halaman checkout server component), tampilkan di Step 2 — harga normal (`marketplace_original_price` / `marketplace_price`) dicoret → `bump_price`.
- Kalau dipilih → `+bump_price` ke subtotal; ebook id ditambahkan ke `ebook_ids`.
- **Webhook:** sudah memproses `metadata.ebook_ids[]` → grant otomatis ke `user_ebooks`. Tanpa perubahan webhook untuk bagian ini.
- Kalau tidak ada ebook bump terkonfigurasi → Step 2 di-skip otomatis (langsung ke pembayaran).

## 5. Perhitungan Harga & Integrasi Tripay

- `subtotal = 99.000 + (vip ? 50.000 : 0) + (bonus ? bump_price : 0)`
- **Fee API** (`src/app/api/payment/fee/route.ts`): terima query param `amount` (default ke base bila tak ada) supaya fee dihitung atas subtotal dinamis (saat ini hardcoded ke base).
- **Create API** (`src/app/api/payment/create/route.ts`):
  - Terima body tambahan: `vip: boolean`, `bonus: boolean`.
  - Hitung subtotal server-side (jangan percaya harga dari client; ambil `bump_price` dari DB).
  - `order_items` multi-item: produk utama + (VIP bila dipilih) + (bonus ebook bila dipilih).
  - `total = subtotal + admin fee`.
  - Simpan di `metadata`: `vip`, `ebook_ids` (termasuk bonus bila dipilih).
- **Client `fetchFee`:** kirim `amount=subtotal` saat subtotal berubah (vip/bonus toggle atau ganti metode).

## 6. Copy CTA

- **Step 1 VIP**
  - Judul: "Mau Dibimbing Langsung Sampai Bisa?"
  - Toggle: "Ya! Tambahkan Konsultasi VIP via WhatsApp (+Rp 50.000)"
  - Tombol utama: "Lanjutkan →"
  - Skip: "Nggak dulu, lanjut tanpa VIP"
- **Step 2 Bonus**
  - Judul: "Tunggu! Ada 1 Penawaran Spesial Buat Kamu"
  - Toggle: "Ya, Ambil [Judul Ebook] cuma Rp X (normal Rp Y)"
  - Tombol utama: "Lanjut ke Pembayaran →"
  - Skip: "Lewati penawaran ini"

## Keamanan / Catatan

- Harga bump & VIP **selalu dihitung ulang di server** (`/api/payment/create`) dari konstanta + DB, tidak dari client (cegah manipulasi harga).
- Webhook tetap memvalidasi `total_amount === existing.amount` (defense-in-depth yang sudah ada).
- `is_bump_product` / `bump_price` hanya bisa diubah lewat admin action (`requireAdmin`).

## File Terdampak

| File | Perubahan |
|---|---|
| `src/types/index.ts` | `MEMBERSHIP_EARLY_BIRD_PRICE` → 99k, tambah `VIP_UPSELL_PRICE` |
| `src/app/(marketing)/page.tsx` | Harga coret 199k → 99k, semua copy harga |
| `src/app/(checkout)/checkout/page.tsx` | Fetch bump ebook, subtitle harga |
| `src/components/member/CheckoutForm.tsx` | Rombak jadi wizard 3-step + 2 bump |
| `src/app/api/payment/fee/route.ts` | Terima param `amount` |
| `src/app/api/payment/create/route.ts` | Terima `vip`/`bonus`, subtotal multi-item, metadata |
| `src/app/api/payment/webhook/route.ts` | Set `is_vip` bila `metadata.vip` |
| `src/app/(admin)/admin/materi/MateriDialog.tsx` | Field bump product + harga |
| `src/app/(admin)/admin/materi/*` (server action) | Simpan `is_bump_product`/`bump_price` |
| `src/app/(admin)/admin/members/page.tsx` | Badge VIP |
| `supabase/migrations/20260608_add_is_vip.sql` | Kolom baru |
| `supabase/migrations/20260608_add_bump_product.sql` | Kolom baru |
