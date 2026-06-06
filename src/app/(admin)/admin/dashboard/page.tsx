import { createAdminClient } from '@/lib/supabase/admin'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { id } from 'date-fns/locale'

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()
  const now = new Date()

  const [
    { count: totalMembers },
    { count: totalBuyers },
    { data: mrrData },
    { count: totalCourses },
    { count: totalEbooks },
  ] = await Promise.all([
    // Total users with role='member'
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'member'),
    // Total unique users who have bought at least 1 ebook
    supabase.from('user_ebooks').select('user_id', { count: 'exact', head: true }),
    // Revenue this month
    supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'PAID')
      .gte('paid_at', startOfMonth(now).toISOString())
      .lte('paid_at', endOfMonth(now).toISOString()),
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('ebooks').select('*', { count: 'exact', head: true }).eq('is_published', true),
  ])

  const mrr = mrrData?.reduce((sum, tx) => sum + tx.amount, 0) ?? 0
  const mrrFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(mrr)

  const stats = [
    { label: 'Total User', value: totalMembers ?? 0 },
    { label: 'Total Pembeli', value: totalBuyers ?? 0 },
    { label: `Revenue ${format(now, 'MMM yyyy', { locale: id })}`, value: mrrFormatted },
    { label: 'Kursus Aktif', value: totalCourses ?? 0 },
    { label: 'Ebook Aktif', value: totalEbooks ?? 0 },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#F5F5F0] mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-[#111111] border border-[#222222] rounded-xl p-5">
            <div className="text-2xl font-bold text-[#D4AF37] mb-1">{value}</div>
            <div className="text-[#888888] text-sm">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
