# Customer Journey — profitdariai

## Model Bisnis
Platform **product-purchase** (bukan membership). Customer beli produk satuan. Setiap produk yang dibeli masuk ke **personal library** di `/materi`.

- **Produk Utama:** Profit Dari AI (E-book) — Rp 199.000 (sekali bayar)
- **Produk Tambahan:** Dijual satuan di `/marketplace` (upsell ke customer yang sudah beli)

---

## 1. Landing Page Discovery
- **Route:** `/` (marketing)
- **Content:**
  - Hero: "Cara Hasilkan Rp 74 Juta dari Produk Digital Buatan AI"
  - Topbar: "EARLY BIRD — Rp 199K"
  - CTAs: "Ya, Saya Mau Mulai Sekarang!" → `/checkout`
  - Proof: Ticker (Rp 74.7M omzet, 1.494 orders, 20.53% conversion)
  - Course outline, testimonials, FAQ
  - Final CTA: "🚀 Mulai Sekarang — Rp 199.000"

---

## 2. Checkout Page
- **Route:** `/checkout` (publik, tidak perlu login)
- **Content:**
  - Order summary: "Profit Dari AI (E-book) — Rp 199.000"
  - Input: Nama + Email
  - Payment method selection: QRIS, OVO, Dana, ShopeePay, BCA VA, Mandiri VA, BNI VA, BRI VA
  - Trust signals: "SSL Aman · Diproses via Tripay"

**Key Decision:** User mengisi data dan klik "Bayar Sekarang"

---

## 3. Payment Initiation
- **API Endpoint:** `POST /api/payment/create`
- **Request:**
  ```json
  {
    "paymentMethod": "QRIS",
    "email": "user@email.com",
    "fullName": "Nama User"
  }
  ```
- **Backend Actions:**
  1. Fetch ebook utama dari DB (sort_order pertama yang published)
  2. Simpan `ebook_ids: [ebook.id]` di metadata transaksi
  3. Buat transaksi di Tripay
  4. Insert record ke tabel `transactions` (status=UNPAID, metadata berisi ebook_ids)
  5. Return `checkout_url`, `qr_url`, `pay_code`

---

## 4. Tripay Checkout
- **Redirect:** User ke `checkout_url` (halaman Tripay)
- **User Actions:**
  - Konfirmasi detail (Rp 199.000)
  - Pilih metode pembayaran
  - Selesaikan pembayaran
- **Tripay Processing:** Kirim webhook ke `/api/payment/webhook`

---

## 5. Payment Confirmation (Webhook)
- **Endpoint:** `POST /api/payment/webhook`
- **Tripay Callback:** `{ status: "PAID", reference: "...", paid_at: ... }`
- **Backend Actions:**
  1. Verifikasi signature webhook
  2. Cari transaksi by reference
  3. Update status → "PAID"
  4. Baca `ebook_ids` dari `metadata` transaksi
  5. **INSERT ke `user_ebooks`** (user_id + ebook_id, source='checkout')
  6. Kirim email konfirmasi ke user
  7. Return `{ success: true }`

**Email Template:**
- Subject: "Produk kamu sudah aktif — Profit dari AI"
- Body: Link ke library + set password (jika guest checkout)

---

## 6. Return to App
- **Route:** `/payment/success`
- **Content:**
  - Success icon (checkmark)
  - "Pembayaran Berhasil!"
  - "Produk kamu sudah aktif dan siap diakses."
  - Tampilkan jumlah produk di library
  - Button: "Buka Library →" → `/materi`

---

## 7. Signup / Login (Guest Checkout Flow)
- **Guest:** Beli dulu tanpa login → setelah PAID, akun otomatis dibuat
- **Email Setup:** User terima email berisi link set-password
- **Setelah Set Password:** Login → langsung ke `/materi`

- **Returning User:** Login → sudah ada ebook di library

---

## 8. Member Library (`/materi`)
- **Route:** `/materi` (protected, login required)
- **Guards:** Tidak login → redirect ke `/login`
- **Content:**
  - Semua ebook dari `ebooks` table ditampilkan
  - **Owned** (ada di `user_ebooks`) → normal, bisa dibaca & didownload
  - **Not owned** → lock overlay, klik → redirect ke marketplace
  - Header: "X ITEM TERSEDIA · Y DIMILIKI"

---

## 9. Marketplace (`/marketplace`)
- **Route:** `/marketplace` (protected, login required)
- **Content:**
  - Produk tambahan dari tabel `marketplace_products`
  - Yang sudah dibeli → badge **"SUDAH DIMILIKI"** + tombol "Buka di Library"
  - Yang belum → tombol "Beli Sekarang" (link ke halaman checkout produk tersebut)
  - Search + filter kategori

---

## 10. Dashboard (`/dashboard`)
- **Route:** `/dashboard` (protected, login required)
- **Content:**
  - Welcome message + quote harian
  - Quick stats: Total materi, kursus, dll
  - **4 materi terbaru** (dari DB)
  - Tombol "Lihat Semua" → `/materi`

---

## 11. Admin Dashboard
- **Route:** `/admin/dashboard` (protected, role='admin' only)
- **Content:**
  - Dashboard stats
  - Manajemen ebook (CRUD)
  - Manajemen marketplace products (CRUD)
  - Daftar user + riwayat pembelian
  - Manajemen transaksi

---

## Database Schema (Ownership)

```
transactions
  - id, user_id, customer_email, customer_name
  - tripay_reference, merchant_ref
  - amount, payment_method, status (UNPAID|PAID|FAILED)
  - metadata: { ebook_ids: [...], ...tripay_data }

user_ebooks  ← tabel baru (June 2026)
  - id, user_id, ebook_id
  - source ('checkout' | 'marketplace' | 'admin')
  - purchased_at

marketplace_products
  - id, slug, title, description, category
  - price, original_price, cover_url, product_url
  - ebook_id (FK ke ebooks) ← kolom baru (June 2026)
  - is_published, sort_order
```

---

## Environment Variables

### Production (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://fnuydaowhneaqldhvufp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

TRIPAY_MODE=production
TRIPAY_API_KEY=...
TRIPAY_PRIVATE_KEY=...
TRIPAY_MERCHANT_CODE=...
TRIPAY_CALLBACK_URL=https://profitdariai.com/api/payment/webhook
TRIPAY_RETURN_URL=https://profitdariai.com/payment/success

SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=admin@profitdariai.com
SMTP_PASS=...

CRON_SECRET=...
```

### Local Development
```
TRIPAY_MODE=sandbox
TRIPAY_CALLBACK_URL=http://localhost:3000/api/payment/webhook
TRIPAY_RETURN_URL=http://localhost:3000/payment/success
```

---

## Testing Checklist

### Sandbox Test
- [ ] User buka `/checkout`
- [ ] Isi nama, email, pilih payment method
- [ ] Klik "Bayar Sekarang"
- [ ] Redirect ke Tripay sandbox checkout
- [ ] Selesaikan pembayaran (test credentials)
- [ ] Webhook diproses — cek log server
- [ ] Email terkirim
- [ ] `user_ebooks` berisi record baru di Supabase
- [ ] Redirect ke `/payment/success`
- [ ] Button "Buka Library" → `/materi` (ebook unlocked)
- [ ] Download ebook berhasil

### Manual Test (Insert Langsung)
```sql
-- Grant ebook ke user untuk testing tanpa payment
INSERT INTO user_ebooks (user_id, ebook_id, source)
VALUES ('uuid-user', 'uuid-ebook', 'admin');
```

---

## Success Metrics

**Customer sees:**
1. ✅ Landing page dengan penawaran Rp 199K
2. ✅ Checkout tanpa harus signup dulu
3. ✅ Pembayaran via berbagai metode (QRIS, VA, e-wallet)
4. ✅ Email konfirmasi setelah bayar
5. ✅ Akses langsung ke library `/materi`
6. ✅ Bisa beli produk tambahan di marketplace

**Backend ensures:**
1. ✅ Payment diverifikasi via Tripay webhook signature
2. ✅ Transaksi tercatat di DB
3. ✅ Ebook diberikan via `user_ebooks` (bukan membership)
4. ✅ Email terkirim
5. ✅ Download API cek kepemilikan via `user_ebooks`
6. ✅ Marketplace tampilkan OWNED status per-user
