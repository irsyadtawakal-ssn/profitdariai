'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, BookOpen, ShoppingBag, Users, LogOut, HelpCircle, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Materi', href: '/admin/materi', icon: BookOpen },
  { label: 'Marketplace', href: '/admin/marketplace', icon: ShoppingBag },
  { label: 'Members', href: '/admin/members', icon: Users },
  { label: 'Pengaturan', href: '/admin/pengaturan', icon: Settings },
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
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col py-8 z-30 bg-[#0E0E0E]/80 backdrop-blur-xl border-r border-gold/20 pt-24 hidden md:flex">
      <div className="px-6 mb-8 mt-4">
        <h2 className="font-mono text-xs text-[#888888] uppercase tracking-[0.15em] mb-1">Admin Panel</h2>
        <p className="font-mono text-[10px] text-gold tracking-widest">COMMAND CENTER V2.4</p>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 px-6 py-3 transition-all ${
                isActive
                  ? 'border-l-4 border-gold bg-gold/10 text-gold font-medium'
                  : 'text-[#888888] hover:bg-[#1A1A1A]/50 hover:text-ivory hover:border-l-4 hover:border-gold/40'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="font-mono text-xs uppercase tracking-wider">{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto px-6 space-y-4">
        <Link
          href="/admin/materi/new"
          className="w-full block text-center bg-gold text-obsidian font-mono text-xs font-bold py-3 cyber-corner hover:brightness-110 active:scale-95 transition-all"
        >
          TAMBAH MATERI
        </Link>
        <div className="space-y-1 pt-4 border-t border-gold/20">
          <a
            href="https://wa.me/628212638792"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 py-2 text-[#888888] hover:text-gold transition-all"
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span className="font-mono text-[10px] uppercase tracking-wider">Support</span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 py-2 text-[#888888] hover:text-[#EF4444] transition-all w-full text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="font-mono text-[10px] uppercase tracking-wider">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
