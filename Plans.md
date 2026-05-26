# profitdariai — Build Plan

## Status: Week 8 Polish & Launch (Next Up)

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

- [x] Checkout flow — `src/app/(member)/checkout/page.tsx` + `CheckoutForm.tsx`
- [x] Payment create API — `src/app/api/payment/create/route.ts`
- [x] Tripay webhook handler + membership activation — `src/app/api/payment/webhook/route.ts`
- [x] Payment success page — `src/app/(member)/payment/success/page.tsx`
- [x] Member dashboard (greeting, highlights, status badge) — `src/app/(member)/dashboard/page.tsx`
- [x] Library kursus (grid, category filter) — `src/app/(member)/kursus/page.tsx`
- [x] Kursus detail + video player (YouTube embed) — `src/app/(member)/kursus/[slug]/page.tsx`
- [x] Library ebook (grid, download) — `src/app/(member)/ebook/page.tsx`
- [x] Ebook detail — `src/app/(member)/ebook/[slug]/page.tsx`
- [x] Ebook download via signed URL — `src/app/api/ebook/download/[id]/route.ts`
- [x] Profile page (info, membership badge, logout) — `src/app/(member)/profile/page.tsx`
- [x] Renewal reminder banner — `src/components/member/RenewalBanner.tsx`
- [x] Member sidebar + bottom nav
- [x] Category filter, CourseCard, EbookCard, ModuleList, VideoPlayer components

## Week 7: Admin Panel ✅ SELESAI

- [x] Admin layout + role guard — `src/app/(admin)/layout.tsx`
- [x] Admin dashboard dengan metrics (members, revenue, content count) — `src/app/(admin)/admin/dashboard/page.tsx`
- [x] Member list (search, filter by status) — `src/app/(admin)/admin/members/page.tsx`
- [x] CRUD kursus + modul — `src/app/(admin)/admin/kursus/`
- [x] CRUD ebook (upload PDF ke Supabase Storage) — `src/app/(admin)/admin/ebook/`

## Week 8: Polish & Launch

- [ ] QA & bug fixing end-to-end
- [ ] Seed 10 kursus + 15 ebook konten
- [ ] Email transactional final (payment success, renewal reminder)
- [x] Renewal reminder cron (Vercel Cron) — `src/app/api/cron/renewal-reminder/route.ts` + `vercel.json`
- [ ] Google Analytics 4 + Vercel Analytics setup
- [ ] Sentry error monitoring
- [ ] Security audit (RLS, webhook signature, signed URLs)
- [ ] Soft launch (50 member)
- [ ] Public launch (IG/TikTok ads)

## Phase 2+: Migrasi ke Hostinger VPS

> Lakukan setelah MVP stabil dan ada revenue. Shared hosting Hostinger tidak support Next.js.

- [ ] Upgrade Hostinger ke VPS plan
- [ ] Install Node.js, PM2, Nginx di VPS
- [ ] Set up `output: 'standalone'` di `next.config.ts`
- [ ] GitHub Actions CI/CD untuk auto-deploy ke VPS
- [ ] Konfigurasi SSL (Let's Encrypt via Certbot)
- [ ] Point DNS dari Vercel ke VPS IP
- [ ] Smoke test semua routes (API, auth, webhook)
