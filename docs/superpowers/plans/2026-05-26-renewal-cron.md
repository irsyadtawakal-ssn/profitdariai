# Renewal Reminder Cron Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kirim email pengingat otomatis ke member yang membership-nya akan berakhir dalam 14 hari atau 3 hari, dijalankan setiap hari jam 09:00 WIB via Vercel Cron.

**Architecture:** Vercel Cron memanggil `POST /api/cron/renewal-reminder` setiap hari. Route memverifikasi `Authorization: Bearer {CRON_SECRET}`, query Supabase Admin untuk member dengan expiry dalam dua window (14 hari dan 3 hari), lalu kirim email via `sendRenewalReminderEmail` yang sudah ada.

**Tech Stack:** Next.js 15 App Router API Route, Supabase Admin Client, Resend (via existing `sendRenewalReminderEmail`), Vercel Cron, Vitest.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/app/api/cron/renewal-reminder/route.ts` | Create | POST handler — auth, query, send, return summary |
| `vercel.json` | Create | Cron schedule config |
| `src/test/api/cron/renewal-reminder.test.ts` | Create | Unit tests untuk handler logic |

---

## Task 1: Cron Route Handler

**Files:**
- Create: `src/app/api/cron/renewal-reminder/route.ts`
- Create: `src/test/api/cron/renewal-reminder.test.ts`

- [ ] **Step 1: Tulis failing test**

```ts
// src/test/api/cron/renewal-reminder.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase admin client
const mockSelect = vi.fn()
const mockFrom = vi.fn(() => ({ select: mockSelect }))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}))

// Mock email sender
const mockSendRenewalReminderEmail = vi.fn().mockResolvedValue({ id: 'email-id' })
vi.mock('@/lib/email/resend', () => ({
  sendRenewalReminderEmail: mockSendRenewalReminderEmail,
}))

// Import handler after mocks
import { POST } from '@/app/api/cron/renewal-reminder/route'

function makeRequest(secret?: string) {
  return new Request('http://localhost/api/cron/renewal-reminder', {
    method: 'POST',
    headers: secret ? { Authorization: `Bearer ${secret}` } : {},
  })
}

describe('POST /api/cron/renewal-reminder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CRON_SECRET = 'test-secret-32-chars-minimum-ok'
  })

  it('returns 401 when Authorization header is missing', async () => {
    const res = await POST(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 401 when secret is wrong', async () => {
    const res = await POST(makeRequest('wrong-secret'))
    expect(res.status).toBe(401)
  })

  it('returns 200 with sent count when no members need reminder', async () => {
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          lte: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    })

    const res = await POST(makeRequest('test-secret-32-chars-minimum-ok'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.sent).toBe(0)
  })

  it('sends emails and returns correct count', async () => {
    const members = [
      { id: '1', full_name: 'Budi', email: 'budi@test.com', membership_expires_at: new Date(Date.now() + 14 * 86400_000).toISOString() },
    ]

    // First call (14-day window) returns members, second call (3-day) returns empty
    mockSelect
      .mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            lte: vi.fn().mockResolvedValue({ data: members, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            lte: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      })

    const res = await POST(makeRequest('test-secret-32-chars-minimum-ok'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.sent).toBe(1)
    expect(mockSendRenewalReminderEmail).toHaveBeenCalledOnce()
    expect(mockSendRenewalReminderEmail).toHaveBeenCalledWith({
      to: 'budi@test.com',
      name: 'Budi',
      expiresAt: expect.any(Date),
      daysLeft: 14,
    })
  })
})
```

- [ ] **Step 2: Jalankan test — pastikan FAIL**

```bash
pnpm test src/test/api/cron/renewal-reminder.test.ts
```

Expected: FAIL — `Cannot find module '@/app/api/cron/renewal-reminder/route'`

- [ ] **Step 3: Buat cron route handler**

```ts
// src/app/api/cron/renewal-reminder/route.ts
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendRenewalReminderEmail } from '@/lib/email/resend'

const WINDOWS = [
  { daysLeft: 14, label: '14-day' },
  { daysLeft: 3, label: '3-day' },
]

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  let sent = 0

  for (const { daysLeft } of WINDOWS) {
    const windowStart = new Date(now)
    windowStart.setDate(windowStart.getDate() + daysLeft - 1)
    windowStart.setHours(0, 0, 0, 0)

    const windowEnd = new Date(now)
    windowEnd.setDate(windowEnd.getDate() + daysLeft)
    windowEnd.setHours(23, 59, 59, 999)

    const { data: members, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, membership_expires_at')
      .eq('role', 'member')
      .gte('membership_expires_at', windowStart.toISOString())
      .lte('membership_expires_at', windowEnd.toISOString())

    if (error) {
      console.error(`[renewal-cron] ${daysLeft}d query error:`, error.message)
      continue
    }

    for (const member of members ?? []) {
      try {
        await sendRenewalReminderEmail({
          to: member.email,
          name: member.full_name ?? 'Member',
          expiresAt: new Date(member.membership_expires_at!),
          daysLeft,
        })
        sent++
      } catch (err) {
        console.error(`[renewal-cron] email failed for ${member.email}:`, err)
      }
    }
  }

  return NextResponse.json({ sent })
}
```

- [ ] **Step 4: Jalankan test — pastikan PASS**

```bash
pnpm test src/test/api/cron/renewal-reminder.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/cron/renewal-reminder/route.ts src/test/api/cron/renewal-reminder.test.ts
git commit -m "feat: renewal reminder cron route with 14-day and 3-day windows"
```

---

## Task 2: vercel.json Cron Config

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Buat vercel.json**

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

> **Note untuk deployment:** Sebelum push ke Vercel, tambahkan `CRON_SECRET` di Vercel dashboard → Settings → Environment Variables. Generate dengan: `openssl rand -hex 32`

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat: vercel cron schedule for renewal reminder (09:00 WIB daily)"
```

---

## Task 3: Full Test Suite

- [ ] **Step 1: Jalankan full test suite**

```bash
pnpm test
```

Expected: semua test pass (60 lama + 4 baru = 64 total).

- [ ] **Step 2: Update Plans.md**

Di `Plans.md`, tandai task renewal cron sebagai `[x]`:

Ubah:
```
- [ ] Renewal reminder cron (Vercel Cron)
```
Menjadi:
```
- [x] Renewal reminder cron (Vercel Cron) — `src/app/api/cron/renewal-reminder/route.ts` + `vercel.json`
```

- [ ] **Step 3: Commit**

```bash
git add Plans.md
git commit -m "chore: mark renewal cron complete in Plans.md"
```
