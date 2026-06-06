'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, BookMarked, ShoppingBag, User, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/materi', label: 'Library', icon: BookMarked },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/profile', label: 'Profil', icon: User },
]

export function MemberSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-[#0A0A0A] border-r border-[#222222]/30 py-8 px-0 fixed top-0 left-0 z-40">
      {/* Brand Header */}
      <div className="px-6 mb-10">
        <h1 className="font-display text-lg font-black tracking-tighter text-[#D4AF37] uppercase">
          Profit Dari AI
        </h1>
        <p className="font-mono text-[9px] text-[#888888] uppercase tracking-[0.2em] mt-1">
          Member Area
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-grow flex flex-col gap-1 px-3">
        {NAV.map(({ href, label: navLabel, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-4 px-4 py-3 text-[11px] font-mono uppercase tracking-wider transition-all duration-200 border-l-4 rounded-none ${
              isActive(href)
                ? 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37] font-bold'
                : 'text-[#F5F5F0]/60 hover:text-[#F5F5F0] hover:bg-[#1A1A1A] border-transparent hover:border-[#D4AF37]/30'
            }`}
          >
            <Icon size={16} />
            {navLabel}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-4 space-y-4">
        {/* Marketplace CTA */}
        <Link
          href="/marketplace"
          className="block p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-colors group"
        >
          <p className="font-mono text-[9px] text-[#D4AF37] mb-1 tracking-wider uppercase">Tambah Koleksi</p>
          <p className="font-display text-white font-bold leading-tight text-xs group-hover:text-[#D4AF37] transition-colors">
            Beli Produk Baru →
          </p>
        </Link>

        {/* Settings and Logout */}
        <div className="pt-4 border-t border-[#222222]/30 space-y-1">
          <Link
            href="/profile"
            className="flex items-center gap-4 px-4 py-2 text-[11px] font-mono uppercase tracking-wider text-[#F5F5F0]/60 hover:text-[#F5F5F0] transition-colors"
          >
            <Settings size={15} />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-2 w-full text-left text-[11px] font-mono uppercase tracking-wider text-red-400/80 hover:text-red-400 transition-colors"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
