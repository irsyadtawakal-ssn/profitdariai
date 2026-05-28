import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendRenewalReminderEmail } from '@/lib/email/sender'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Members expiring in 7 days (±12 jam window)
  const from = new Date(Date.now() + 6.5 * 24 * 60 * 60 * 1000).toISOString()
  const to = new Date(Date.now() + 7.5 * 24 * 60 * 60 * 1000).toISOString()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('email, full_name, membership_expires_at')
    .gte('membership_expires_at', from)
    .lte('membership_expires_at', to)
    .not('email', 'is', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = await Promise.allSettled(
    (profiles ?? []).map((p) =>
      sendRenewalReminderEmail(p.email!, p.full_name ?? 'Member', p.membership_expires_at!)
    )
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return NextResponse.json({ sent, failed })
}
