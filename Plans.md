# profitdariai — Build Plan

## Status: VPS Live ✅ | Ownership System Active ✅ | Ready for Production Testing

---

## Week 1-2: Foundation ✅ SELESAI

- [x] Setup repo, Next.js 16, Tailwind 4, TypeScript, ESLint, Prettier
- [x] Folder structure (route groups, lib, types, supabase migrations)
- [x] Supabase client (browser + server + admin)
- [x] Auth middleware (`src/proxy.ts` — Next.js 16 convention)
- [x] Tripay integration skeleton (`src/lib/tripay/`)
- [x] Email system skeleton (`src/lib/email/`)
- [x] Type definitions (`src/types/database.ts`)
- [x] SQL migrations (`supabase/migrations/`) — sudah dijalankan di Supabase
- [x] `.env.example`
- [x] Setup Supabase project + run migrations
- [x] Setup Vercel project (free tier) — domain profitdariai.com belakangan
- [x] Shadcn/ui + brand CSS variables (HSL, CSS-first Tailwind 4)
- [x] UI primitives: Button, Card, Input, Label, Badge, Dialog
- [x] Logo component + Sonner Toaster
- [x] Auth pages: Login, Signup, Reset Password, Reset Confirm
- [x] Auth forms: react-hook-form + zod + Supabase Auth
- [x] Vitest + @testing-library/react — 20 tests, semua pass

## Week 3-4: Marketing & Auth ✅ SELESAI

- [x] Landing page (hero, value prop, FAQ, CTA) — `src/app/(marketing)/page.tsx`
- [x] Pricing page (single tier, early bird counter) — `src/app/(marketing)/pricing/page.tsx`
- [x] FAQ page — `src/app/(marketing)/faq/page.tsx`
- [x] Signup form + Supabase auth
- [x] Login form + session handling
- [x] Reset password flow
- [x] Email verification callback (`/api/auth/callback`)

## Week 5-6: Payment & Member Area ✅ SELESAI

- [x] Checkout flow — `src/app/(checkout)/checkout/page.tsx` + `CheckoutForm.tsx`
- [x] Payment create API — `src/app/api/payment/create/route.ts`
  - Menyimpan `ebook_ids` di metadata transaksi (untuk webhook)
- [x] Tripay webhook handler + **ownership activation** via `user_ebooks` — `src/app/api/payment/webhook/route.ts`
- [x] Payment success page — menampilkan jumlah produk di library
- [x] Marketplace checkout API per-produk — `src/app/api/payment/marketplace/route.ts`
- [x] Member dashboard (greeting, highlights, latest materi grid) — `src/app/(member)/dashboard/page.tsx`
- [x] Library kursus (grid, category filter) — `src/app/(member)/kursus/page.tsx`
- [x] Kursus detail + video player (YouTube embed)
- [x] Library ebook / Materi (`/materi`) — owned = unlock, not owned = locked — `src/app/(member)/materi/page.tsx`
- [x] Ebook detail — `src/app/(member)/materi/[slug]/page.tsx`
- [x] Ebook download via signed URL (cek ownership via `user_ebooks`) — `src/app/api/ebook/download/[id]/route.ts`
- [x] Profile page (info, status akses, logout)
- [x] ~~RenewalBanner~~ — dihapus (tidak relevan, tidak ada renewal)
- [x] Member sidebar (CTA "Beli Produk Baru →" /marketplace) + bottom nav
- [x] Marketplace page — server component, fetch dari DB, OWNED badge
- [x] MarketplaceClient — search/filter + CheckoutModal per produk

## Week 7: Admin Panel ✅ SELESAI

- [x] Admin layout + role guard — `src/app/(admin)/layout.tsx`
- [x] Admin dashboard — Total User, **Total Pembeli** (user_ebooks), Revenue bulan ini, Kursus & Ebook aktif
- [x] User list — search, filter by "Ada Pembelian / Belum Beli" (dari user_ebooks count)
- [x] CRUD kursus + modul
- [x] CRUD ebook (Google Drive URL, bukan upload langsung)
  - ~~Upload PDF ke Supabase Storage~~ → diganti Google Drive URL (anti size-limit)
  - Auto-convert GDrive share link → direct download URL

## Week 8: Polish & Launch ✅ SELESAI

### Ownership System Migration (6 Jun 2026) ✅
- [x] **Hapus sistem membership** — purge semua `membership_expires_at` logic
- [x] **`user_ebooks` table** — tracking kepemilikan per-user per-ebook
  - Migration: `supabase/migrations/20260606_user_ebooks.sql`
  - RLS: users hanya bisa lihat ebook milik sendiri
- [x] **`ebook_id` di marketplace_products** — FK ke ebooks
- [x] **Materi Library** — semua ebook tampil, owned = unlock, locked = block download
- [x] **Marketplace** — server component + OWNED badge per produk
- [x] **Download API** — validasi kepemilikan via `user_ebooks` (403 jika belum beli)
- [x] **Proxy/middleware** — hapus membership gate, cukup auth check
- [x] **Marketplace checkout** — CheckoutModal + `/api/payment/marketplace` (per-produk)

### Design System: Aureum Cyber ✅
- [x] Premium Neo-Cyberpunk aesthetic — `#0A0A0A`, `#D4AF37`, `#F5F5F0`
- [x] `rounded-none` — semua elemen flat/angular (no border-radius kecuali UI primitif)
- [x] Glassmorphism + cyber-corner decorative elements
- [x] Font: Geist (display) + Inter (body) + JetBrains Mono (mono)
- [x] Login/Signup page premium redesign (art panel + form panel)

### Bug Fixes ✅
- [x] Login error toast — improved error handling
- [x] Vercel env vars — production env vars configured
- [x] Ebook GDrive URL — auto-convert share link → direct download URL
- [x] Payment 500 error — fix Tripay fee-calculator response parsing

### Performance ✅
- [x] Loading skeletons — `loading.tsx` per member route
- [x] `unstable_cache` — `getCachedCourses`, `getCachedEbooks` (60s TTL)
- [x] React `cache()` — server client deduplicated per request
- [x] Streaming Suspense — dashboard content grid

### Security ✅
- [x] `middleware.ts` dibuat — semua protected routes diproteksi di edge
- [x] Open redirect blocked — `?next=//evil.com` diblock
- [x] Input validation payment — email regex + fullName length check
- [x] Webhook amount validation — defense-in-depth amount mismatch check
- [x] Ebook download draft — `.eq('is_published', true)` agar draft tidak bisa didownload
- [x] Ownership validation — download API cek `user_ebooks` (403 jika belum beli)

### Email ✅
- [x] `purchaseConfirmationEmail` — "Produk kamu aktif, Buka Library →"
- [x] Guest welcome email — link set-password
- [x] Email sender: `admin@profitdariai.com` via Hostinger SMTP

### Remaining
- [ ] QA & bug fixing end-to-end dengan real payment (butuh public URL)
- [ ] Google Analytics 4 + Vercel Analytics setup
- [ ] Populate `marketplace_products` dengan produk upsell + set `ebook_id`
- [ ] Soft launch (50 beta tester)
- [ ] Public launch (IG/TikTok ads)

---

## Phase 2: VPS Hostinger ✅ SELESAI (29 May 2026)

> VPS: Biznet GIO NEO Lite SS 2.2 — IP `103.93.163.183` — Live: **https://profitdariai.com**

- [x] `next.config.ts` → tambah `output: 'standalone'`
- [x] Beli & setup VPS — Biznet GIO NEO Lite SS 2.2 (2 vCPU, 2GB RAM, 60GB SSD)
- [x] Install Node.js 20 (nvm), pnpm, PM2, Nginx
- [x] Setup SSH key untuk GitHub Actions
- [x] Deploy manual pertama + PM2 ecosystem config (`ecosystem.config.js`)
- [x] Nginx reverse proxy config (localhost:3000)
- [x] SSL via Certbot (Let's Encrypt) — expires 2026-08-27, auto-renew ✅
- [x] GitHub Actions CI/CD (`deploy.yml`) — auto-deploy on push to main
- [x] Ganti Vercel Cron → system crontab untuk renewal-reminder
- [x] Update Tripay whitelist IP → `103.93.163.183`
- [x] Migrasi DNS (A record → IP VPS via Niagahoster)
- [x] Smoke test checklist — landing, auth, member, admin, payment ✅
- [ ] Monitor & stabilisasi (ongoing)

---

## Phase 3: Production Launch 🚀 NEXT

### Checklist Pre-Launch
- [ ] Push commit terbaru ke VPS (`git push` → GitHub Actions auto-deploy)
- [ ] Jalankan SQL migration `20260606_user_ebooks.sql` di Supabase production (sudah dijalankan lokal)
- [ ] Test end-to-end payment di production (Tripay webhook → user_ebooks → library unlock)
- [ ] Populate `marketplace_products` dengan produk upsell (admin panel)
- [ ] QA: login → checkout → bayar → cek email → cek /materi unlock
- [ ] Setup GA4

### Checklist Soft Launch
- [ ] Invite 50 beta tester
- [ ] Monitor konversi & support
- [ ] Fix bug yang muncul

### Public Launch
- [ ] Announce di IG/TikTok
- [ ] Run ads

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Payment | Tripay (QRIS, VA, e-wallet) |
| Email | Hostinger SMTP (admin@profitdariai.com) |
| Hosting | Biznet GIO VPS + Nginx + PM2 |
| CI/CD | GitHub Actions |
| Monitoring | PM2 + Sentry (optional) |

## Business Model

| Produk | Harga | Flow |
|--------|-------|------|
| Produk Utama (E-book) | Rp 199.000 | `/checkout` → webhook → `user_ebooks` |
| Produk Marketplace | Sesuai produk | `/marketplace` → CheckoutModal → webhook → `user_ebooks` |
