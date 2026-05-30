'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookMarked, ShoppingBag, User } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { isMembershipActive } from '@/lib/membership'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/materi', label: 'Materi', icon: BookMarked },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/profile', label: 'Profil', icon: User },
]

interface MemberSidebarProps {
  expiresAt: string | null
}

export function MemberSidebar({ expiresAt }: MemberSidebarProps) {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  const active = isMembershipActive({ membership_expires_at: expiresAt })
  const label = expiresAt ? format(new Date(expiresAt), 'd MMM yyyy', { locale: id }) : null

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-[#111111] border-r border-[#222222] py-6 px-3 fixed top-0 left-0 z-40">
      <div className="px-3 mb-8">
        <Logo />
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ href, label: navLabel, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(href)
                ? 'text-[#D4AF37] bg-[#D4AF37]/10 border-l-2 border-[#D4AF37] pl-[10px]'
                : 'text-[#F5F5F0]/60 hover:text-[#F5F5F0] hover:bg-[#1A1A1A]'
            }`}
          >
            <Icon size={18} />
            {navLabel}
          </Link>
        ))}
      </nav>
      {label && (
        <div className="mt-auto px-3 pt-4 border-t border-[#222222]">
          <span
            className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
              active ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-red-900/30 text-red-400'
            }`}
          >
            {active ? `Aktif s/d ${label}` : 'Expired'}
          </span>
        </div>
      )}
    </aside>
  )
}
