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
