'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Kursus', href: '/admin/kursus' },
  { label: 'Materi', href: '/admin/materi' },
  { label: 'Marketplace', href: '/admin/marketplace' },
  { label: 'Members', href: '/admin/members' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-52 flex-shrink-0 border-r border-[#222222] min-h-screen p-4 flex flex-col">
      <div className="text-[#D4AF37] font-bold text-sm mb-6 px-2 tracking-widest">ADMIN</div>
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname.startsWith(href)
                ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-medium border-l-2 border-[#D4AF37] pl-[10px]'
                : 'text-[#F5F5F0]/60 hover:text-[#F5F5F0] hover:bg-[#1A1A1A]'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#888888] hover:text-[#EF4444] hover:bg-[#1A1A1A] transition-colors w-full mt-4"
      >
        <LogOut size={14} />
        Logout
      </button>
    </aside>
  )
}
