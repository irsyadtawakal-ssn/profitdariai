# profitdariai

Platform membership kursus & ebook AI Indonesia. **Stack:** Next.js 15 (App Router) + Supabase + Tripay + YouTube Unlisted (video) + Resend + Vercel.

## Quick Commands

```bash
pnpm dev          # dev server :3000
pnpm build        # production build
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
```

## Architecture

- **`src/app/(marketing)/`** — Public pages (landing, pricing, FAQ) — no auth
- **`src/app/(auth)/`** — Auth flow (login, signup, reset)
- **`src/app/(member)/`** — Protected member area (dashboard, kursus, ebook, profile)
- **`src/app/(admin)/`** — Admin CMS (role = 'admin' only)
- **`src/app/api/`** — API routes (auth callback, Tripay payment + webhook, ebook download)
- **`src/lib/supabase/`** — `client.ts` (browser), `server.ts` (RSC), `admin.ts` (service_role)
- **`src/lib/tripay/`** — Payment integration (webhook uses `timingSafeEqual`)
- **`src/lib/auth/requireAdmin.ts`** — Call at top of every admin server action
- **`src/lib/youtube.ts`** — Extract YouTube ID + generate embed URL
- **`src/components/member/VideoPlayer.tsx`** — YouTube iframe player
- **`src/lib/email/`** — SMTP email (mailer, sender, templates)
- **`src/lib/membership.ts`** — Membership status helpers
- **`src/proxy.ts`** — Auth gate + membership check + admin gate (Next.js 16 uses `proxy.ts` / `export function proxy`)
- **`supabase/migrations/`** — SQL migrations (run in Supabase SQL editor)

## Key Rules

- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` to the client — admin client is server-only
- **Always** call `await requireAdmin()` at the top of every `'use server'` admin action
- **Always** verify Tripay webhook signature before processing (uses `timingSafeEqual`)
- **RLS enabled** on all Supabase tables
- **Video:** YouTube Unlisted MVP — `course_modules.video_url` simpan YouTube video ID atau URL. Phase 2+ migrasi ke Bunny.net.
- Membership check = `membership_expires_at > NOW()`
- Brand colors: Obsidian `#0A0A0A`, Gold `#D4AF37`, Ivory `#F5F5F0`
- UI tone: confident, direct, "kamu" (not "Anda" or "lo")
- Package manager: **pnpm only**

## Env Setup

Copy `.env.example` → `.env.local` and fill in credentials.

## Database

Run migrations in order in Supabase SQL editor:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_seed_data.sql` (set your email as admin)

## Pricing

- **Lifetime** membership: `MEMBERSHIP_LIFETIME_EXPIRY = '2099-12-31'`
- Harga: `MEMBERSHIP_EARLY_BIRD_PRICE = 199_000` (aktif sekarang)
- Konstanta di `src/types/index.ts`
