import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { MemberSidebar } from '@/components/member/MemberSidebar'
import { MemberBottomNav } from '@/components/member/MemberBottomNav'

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      <div className="cyber-grid fixed inset-0 z-0 pointer-events-none" />
      <MemberSidebar />
      <div className="md:ml-64 flex flex-col min-h-screen relative z-10">
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>
      <MemberBottomNav />
    </div>
  )
}
