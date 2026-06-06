import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F0] cyber-grid relative font-sans">
      <AdminHeader user={profile} />
      <div className="flex pt-20">
        <AdminSidebar />
        <main className="flex-1 md:pl-64 min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  )
}

