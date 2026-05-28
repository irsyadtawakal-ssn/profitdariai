'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <Button
      onClick={handleLogout}
      variant="secondary"
      className="text-[#888888] hover:text-red-400 hover:border-red-400/40"
    >
      Keluar
    </Button>
  )
}
