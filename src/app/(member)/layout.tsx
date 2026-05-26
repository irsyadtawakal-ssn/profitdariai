import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { isRenewalWarning } from '@/lib/membership'
import { MemberSidebar } from '@/components/member/MemberSidebar'
import { MemberBottomNav } from '@/components/member/MemberBottomNav'
import { RenewalBanner } from '@/components/member/RenewalBanner'

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('membership_expires_at')
    .eq('id', user.id)
    .single()

  const expiresAt = profile?.membership_expires_at ?? null
  const showRenewal = expiresAt ? isRenewalWarning({ membership_expires_at: expiresAt }) : false

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <MemberSidebar expiresAt={expiresAt} />
      <div className="md:ml-56 flex flex-col min-h-screen">
        {showRenewal && expiresAt && <RenewalBanner expiresAt={expiresAt} />}
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>
      <MemberBottomNav />
    </div>
  )
}
