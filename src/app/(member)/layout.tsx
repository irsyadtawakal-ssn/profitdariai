import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Sidebar + main content — Week 5-6 */}
      {children}
    </div>
  )
}
