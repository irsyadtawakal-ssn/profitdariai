import { createServerClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, membership_expires_at')
    .eq('id', user!.id)
    .single()

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-[#F5F5F0]">
        Halo, {profile?.full_name ?? 'Member'}!
      </h1>
      {/* Dashboard content — Week 5-6 */}
    </main>
  )
}
