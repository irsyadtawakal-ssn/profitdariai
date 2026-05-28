import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFrom, mockSendRenewalReminderEmail } = vi.hoisted(() => {
  const mockNot = vi.fn().mockResolvedValue({ data: [], error: null })
  const mockLte = vi.fn(() => ({ not: mockNot }))
  const mockGte = vi.fn(() => ({ lte: mockLte }))
  const mockSelect = vi.fn(() => ({ gte: mockGte }))
  const mockFrom = vi.fn(() => ({ select: mockSelect }))
  const mockSendRenewalReminderEmail = vi.fn().mockResolvedValue(undefined)
  return { mockFrom, mockSendRenewalReminderEmail }
})

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}))

vi.mock('@/lib/email/sender', () => ({
  sendRenewalReminderEmail: mockSendRenewalReminderEmail,
}))

import { GET } from '@/app/api/cron/renewal-reminder/route'

function makeRequest(secret?: string) {
  return new Request('http://localhost/api/cron/renewal-reminder', {
    method: 'GET',
    headers: secret ? { authorization: `Bearer ${secret}` } : {},
  })
}

describe('GET /api/cron/renewal-reminder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CRON_SECRET = 'test-secret'
  })

  it('returns 401 when authorization header is missing', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 401 when secret is wrong', async () => {
    const res = await GET(makeRequest('wrong'))
    expect(res.status).toBe(401)
  })

  it('returns 200 with sent:0 when no members need reminder', async () => {
    const res = await GET(makeRequest('test-secret'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.sent).toBe(0)
  })
})
