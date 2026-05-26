# Renewal Reminder Cron — Design Spec

**Date:** 2026-05-26  
**Status:** Approved

## Goal

Kirim email pengingat otomatis kepada member yang membership-nya akan berakhir, supaya mereka punya waktu untuk perpanjang sebelum akses terkunci.

## Architecture

Vercel Cron memanggil `POST /api/cron/renewal-reminder` setiap hari jam 09:00 WIB (02:00 UTC). Route memverifikasi `Authorization: Bearer {CRON_SECRET}`, lalu query Supabase untuk member dengan expiry dalam window tertentu, dan kirim email via Resend.

## Files

| File | Action | Responsibility |
|------|--------|----------------|
| `src/app/api/cron/renewal-reminder/route.ts` | Create | POST handler — auth check, query, send emails, return summary |
| `vercel.json` | Create | Cron schedule definition |

## Route: `POST /api/cron/renewal-reminder`

### Auth

Header wajib: `Authorization: Bearer {CRON_SECRET}`  
Jika tidak ada atau tidak cocok → return `401 Unauthorized`

`CRON_SECRET` disimpan di environment variable Vercel.

### Query Logic

Dua reminder window per run:
- **14 hari** — `membership_expires_at` antara `now + 13 days` dan `now + 14 days`
- **3 hari** — `membership_expires_at` antara `now + 2 days` dan `now + 3 days`

Gunakan `createAdminClient()` (bypasses RLS). Query `profiles` where `role = 'member'`.

### Email

Panggil `sendRenewalReminderEmail` (sudah ada di `src/lib/email/resend.ts`) untuk setiap member yang ditemukan.

### Response

```json
{ "sent": 5 }
```

Error tetap return `200` dengan `{ "sent": 0, "error": "..." }` supaya Vercel tidak retry agresif.

## vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/renewal-reminder",
      "schedule": "0 2 * * *"
    }
  ]
}
```

`0 2 * * *` = setiap hari jam 02:00 UTC = 09:00 WIB.

## Environment Variables

| Var | Keterangan |
|-----|-----------|
| `CRON_SECRET` | String acak minimum 32 karakter. Set di Vercel dashboard → Settings → Environment Variables. |

## Out of Scope

- Tracking email yang sudah dikirim (dedup) — untuk MVP cukup query window per hari
- Unsubscribe link — Phase 2
- Template polish — Phase 2
