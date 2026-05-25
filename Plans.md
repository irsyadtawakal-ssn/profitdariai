# profitdariai — Build Plan

## Status: Week 1-2 Foundation (In Progress)

---

## Week 1-2: Foundation ✅ Scaffolding Done

- [x] Setup repo, Next.js 15, Tailwind 4, TypeScript, ESLint, Prettier
- [x] Folder structure (route groups, lib, types, supabase migrations)
- [x] Supabase client (browser + server + admin)
- [x] Auth middleware (`src/middleware.ts`)
- [x] Tripay integration skeleton (`src/lib/tripay/`)
- [x] Email system skeleton (`src/lib/email/`)
- [x] Type definitions (`src/types/database.ts`)
- [x] SQL migrations (`supabase/migrations/`)
- [x] `.env.example`
- [ ] Setup Supabase project + run migrations
- [ ] Setup Vercel project (free tier) + connect domain profitdariai.com (Hostinger DNS → Vercel CNAME)
- [ ] Implement UI primitives: Button, Card, Input, Badge, Modal

## Week 3-4: Marketing & Auth

- [ ] Landing page (hero, value prop, FAQ, CTA)
- [ ] Pricing page (single tier, early bird counter)
- [ ] Signup form + Supabase auth
- [ ] Login form + session handling
- [ ] Reset password flow
- [ ] Email verification callback (`/api/auth/callback`)

## Week 5-6: Payment & Member Area

- [ ] Checkout flow (payment method picker → Tripay create)
- [ ] Tripay webhook handler + membership activation
- [ ] Member dashboard (greeting, highlights, status badge)
- [ ] Library kursus (grid, category filter)
- [ ] Kursus detail + video player (hls.js)
- [ ] Library ebook (grid, download)
- [ ] Ebook download via signed URL
- [ ] Profile page (info, membership badge, logout)
- [ ] Renewal reminder banner (14 days warning)

## Week 7: Admin Panel

- [ ] Admin layout + role guard
- [ ] CRUD kursus + modul
- [ ] CRUD ebook (upload PDF ke Supabase Storage)
- [ ] Admin dashboard metrics (members, MRR, top content)
- [ ] Member list (search, filter by status)

## Week 8: Polish & Launch

- [ ] QA & bug fixing
- [ ] Seed 10 kursus + 15 ebook konten
- [ ] Email transactional final (payment success, renewal reminder)
- [ ] Renewal reminder cron (Vercel Cron)
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
