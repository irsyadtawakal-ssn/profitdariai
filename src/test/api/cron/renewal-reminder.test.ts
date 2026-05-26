import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoist mocks so variables are available before vi.mock hoisting
const { mockSelect, mockFrom, mockSendRenewalReminderEmail } = vi.hoisted(() => {
  const mockSelect = vi.fn()
  const mockFrom = vi.fn(() => ({ select: mockSelect }))
  const mockSendRenewalReminderEmail = vi.fn().mockResolvedValue({ id: 'email-id' })
  return { mockSelect, mockFrom, mockSendRenewalReminderEmail }
})

// Mock Supabase admin client
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}))

// Mock email sender
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
