# profitdariai

Platform membership kursus & ebook AI Indonesia. **Stack:** Next.js 16 (App Router) + Supabase + Tripay + YouTube Unlisted (video) + Resend + Vercel.

## Quick Commands

```bash
pnpm dev          # dev server :3000
pnpm build        # production build
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
```

## Architecture

- **`src/app/(marketing)/`** — Public pages (landing, pricing, FAQ, legal pages) — no auth
- **`src/app/(auth)/`** — Auth flow (login, signup, reset)
- **`src/app/(member)/`** — Protected member area (dashboard, kursus, ebook, profile)
- **`src/app/(admin)/`** — Admin CMS (role = 'admin' only)
- **`src/app/api/`** — API routes (auth callback, Tripay payment + webhook, ebook download)
- **`src/lib/supabase/`** — `client.ts` (browser), `server.ts` (RSC + React `cache()` dedup), `admin.ts` (service_role)
  - `createServerClient` — wrapped dengan `cache()`, dibuat sekali per request
  - `getServerUser` — helper cached untuk dapat user tanpa duplikasi `getUser()` call
- **`src/lib/cache/content.ts`** — `unstable_cache` wrappers untuk data publik (60s TTL):
  - `getCachedCourses(category?)` — course list untuk member area
  - `getCachedEbooks(category?)` — ebook list untuk member area
  - `getCachedCourseCounts()` — stat counts untuk dashboard
- **`src/lib/tripay/`** — Payment integration (webhook uses `timingSafeEqual`)
- **`src/lib/auth/requireAdmin.ts`** — Call at top of every admin server action
- **`src/lib/youtube.ts`** — Extract YouTube ID + generate embed URL
- **`src/components/member/VideoPlayer.tsx`** — YouTube iframe player
- **`src/lib/email/`** — SMTP email (mailer, sender, templates)
- **`src/lib/membership.ts`** — Membership status helpers
- **`src/middleware.ts`** — Entry point Next.js middleware, re-export `proxy` dari `proxy.ts`
- **`src/proxy.ts`** — Implementasi middleware: auth gate, membership check, admin gate. Proteksi routes: `/dashboard`, `/kursus`, `/ebook`, `/profile`, `/admin`
- **`supabase/migrations/`** — SQL migrations (run in Supabase SQL editor)
- **`docs/vps-migration.md`** — Panduan lengkap migrasi dari Vercel ke Hostinger VPS (Phase 2+)

## Legal Pages (Tripay Merchant Review)

Semua legal pages ada di `src/app/(marketing)/` dan dapat diakses tanpa login:

| Route | File | Keterangan |
|---|---|---|
| `/ketentuan-layanan` | `ketentuan-layanan/page.tsx` | Terms of Service |
| `/kebijakan-privasi` | `kebijakan-privasi/page.tsx` | Privacy Policy |
| `/kebijakan-refund` | `kebijakan-refund/page.tsx` | No-refund policy (produk digital) |
| `/kontak` | `kontak/page.tsx` | Kontak Support (WA + Email) |

**Contact info:**
- WhatsApp: `628212638792`
- Email: `adimin@profitdariai.com`

## Tripay Integration Notes

- **Whitelist IP:** Vercel menggunakan IP dinamis — tidak bisa diisi IP tetap tanpa upgrade ke Vercel Pro + Static IPs ($100/bulan) atau VPS proxy. Solusi: hubungi Tripay support untuk exception, atau gunakan VPS murah (~Rp 30–50rb/bulan) sebagai proxy.
- Webhook signature diverifikasi dengan `timingSafeEqual` di `src/lib/tripay/`
- SKU produk: `PDA-MEMBERSHIP-LIFETIME` (tidak diubah agar tidak merusak transaksi lama)

## Key Rules

- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` to the client — admin client is server-only
- **Always** call `await requireAdmin()` at the top of every `'use server'` admin action
- **Always** verify Tripay webhook signature before processing (uses `timingSafeEqual`)
- **RLS enabled** on all Supabase tables
- **Video:** YouTube Unlisted MVP — `course_modules.video_url` simpan YouTube video ID atau URL. Phase 2+ migrasi ke Bunny.net.
- **Ebook file source:** `ebooks.file_path` bisa berisi:
  - **GDrive URL** (`https://drive.google.com/uc?export=download&id=...`) — admin input link share GDrive, auto-convert di `EbookDialog.tsx`
  - **Supabase Storage path** (legacy) — signed URL via `createSignedUrl`. Download API di `/api/ebook/download/[id]` handle keduanya secara otomatis.
- Membership check = `membership_expires_at > NOW()`
- Brand colors: Obsidian `#0A0A0A`, Gold `#D4AF37`, Ivory `#F5F5F0`
- Brand fonts: **Geist** (display/heading), **Inter** (body), **JetBrains Mono** (angka/data)
  - Marketing layout (`src/app/(marketing)/layout.tsx`) load Geist + JetBrains_Mono via `next/font/google`
  - `landing.css` pakai `var(--font-display)` dan `var(--font-mono-nums)` dari CSS variables
- UI tone: confident, direct, "kamu" (not "Anda" or "lo")
- Package manager: **pnpm only**
- Kata "lifetime" sudah dihapus dari semua marketing copy (landing page, checkout, API) — gunakan "Akses Penuh" atau "Sekali Bayar"

## Security

- **Middleware** — `src/middleware.ts` → `src/proxy.ts` aktif di semua protected routes sebelum page render
- **Auth callback** — `?next=` param divalidasi: harus diawali `/` dan bukan `//` (cegah open redirect)
- **Payment create** — email regex + fullName length validated sebelum request ke Tripay API
- **Webhook** — signature diverifikasi dengan `timingSafeEqual` (timing-safe). Guest email yang sudah terdaftar di-link ke akun existing, bukan gagal silent
- **Ebook download** — cek auth + active membership + `is_published = true` sebelum serve URL
- **Admin actions** — semua server actions wajib `await requireAdmin()` di baris pertama (pakai `.maybeSingle()`)
- **RLS** — enabled di semua tabel Supabase

## Performance

- **`unstable_cache`** — courses & ebooks di-cache 60 detik di server memory (`src/lib/cache/content.ts`). Admin actions (`revalidatePath`) bust cache saat konten berubah.
- **`loading.tsx`** — setiap member route punya skeleton loading yang muncul instan saat navigasi (`dashboard`, `kursus`, `ebook`, `profile`).
- **Streaming Suspense** — dashboard split: content grid (cached, instant) + `<MemberHeader>` (user-specific, stream in after profile query).
- **`next/image`** — `CourseCard` dan `EbookCard` pakai `<Image fill>` dengan `sizes` prop untuk lazy load + WebP otomatis.
- **React `cache()`** — `createServerClient` di-wrap `cache()` sehingga dibuat sekali per request meski dipanggil dari layout dan page.

## Env Setup

Copy `.env.example` → `.env.local` and fill in credentials.

## Database

Run migrations in order in Supabase SQL editor:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_seed_data.sql` (set your email as admin)

## Pricing

- **Sekali bayar** (tanpa biaya bulanan): `MEMBERSHIP_LIFETIME_EXPIRY = '2099-12-31'`
- Harga: `MEMBERSHIP_EARLY_BIRD_PRICE = 199_000` (aktif sekarang)
- Konstanta di `src/types/index.ts`
