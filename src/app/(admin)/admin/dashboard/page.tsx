import { createAdminClient } from '@/lib/supabase/admin'
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns'
import { id } from 'date-fns/locale'
import { InteractiveDashboard } from '@/components/admin/InteractiveDashboard'

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()
  const now = new Date()

  // Fetch counts, transactions, and user ebooks
  const [
    { count: totalMembersCount },
    { data: userEbooksData },
    { data: mrrData },
    { count: totalCoursesCount },
    { count: totalEbooksCount },
  ] = await Promise.all([
    // Total users with role='member'
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'member'),
    // Total unique users who have bought at least 1 ebook
    supabase.from('user_ebooks').select('user_id'),
    // Revenue this month
    supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'PAID')
      .gte('paid_at', startOfMonth(now).toISOString())
      .lte('paid_at', endOfMonth(now).toISOString()),
    // Course & Ebook counts
    supabase.from('courses').select('id', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('ebooks').select('id', { count: 'exact', head: true }).eq('is_published', true),
  ])

  const totalMembers = totalMembersCount ?? 0
  const totalCourses = totalCoursesCount ?? 0
  const totalEbooks = totalEbooksCount ?? 0

  // Calculate unique buyers
  const totalBuyers = new Set(userEbooksData?.map((x) => x.user_id) ?? []).size

  // Calculate MRR (Revenue this month)
  const mrr = mrrData?.reduce((sum, tx) => sum + tx.amount, 0) ?? 0
  const mrrFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(mrr)

  // Chart: Daily revenue for the last 12 days
  const chartData = []
  const twelveDaysAgo = subDays(now, 11)

  const { data: recentTxs } = await supabase
    .from('transactions')
    .select('amount, paid_at')
    .eq('status', 'PAID')
    .gte('paid_at', twelveDaysAgo.toISOString())
    .order('paid_at', { ascending: true })

  for (let i = 11; i >= 0; i--) {
    const day = subDays(now, i)
    const dateStr = format(day, 'yyyy-MM-dd')

    const dayTotal =
      recentTxs?.reduce((sum, tx) => {
        if (!tx.paid_at) return sum
        const txDateStr = format(new Date(tx.paid_at), 'yyyy-MM-dd')
        return txDateStr === dateStr ? sum + tx.amount : sum
      }, 0) ?? 0

    chartData.push({
      label: format(day, 'dd MMM', { locale: id }),
      value: dayTotal,
    })
  }

  const maxChartVal = Math.max(...chartData.map((c) => c.value), 1)

  // Newest Members (limit 5) with ownership-based active/pending status
  const { data: recentProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at')
    .eq('role', 'member')
    .order('created_at', { ascending: false })
    .limit(5)

  const profileIds = recentProfiles?.map((p) => p.id) ?? []

  const { data: userEbooksOwnerships } =
    profileIds.length > 0
      ? await supabase.from('user_ebooks').select('user_id').in('user_id', profileIds)
      : { data: [] }

  const newestMembers =
    recentProfiles?.map((profile) => {
      const ownedCount = userEbooksOwnerships?.filter((o) => o.user_id === profile.id).length ?? 0
      return {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        created_at: profile.created_at,
        status: ownedCount > 0 ? 'ACTIVE' : 'PENDING',
      }
    }) ?? []

  return (
    <InteractiveDashboard
      totalMembers={totalMembers}
      totalBuyers={totalBuyers}
      mrrFormatted={mrrFormatted}
      totalEbooks={totalEbooks}
      totalCourses={totalCourses}
      newestMembers={newestMembers}
      chartData={chartData}
      maxChartVal={maxChartVal}
    />
  )
}
