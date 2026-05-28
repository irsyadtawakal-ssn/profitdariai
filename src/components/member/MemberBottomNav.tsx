'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, BookMarked, ShoppingBag, User } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kursus', label: 'Kursus', icon: BookOpen },
  { href: '/ebook', label: 'Ebook', icon: BookMarked },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/profile', label: 'Profil', icon: User },
]

export function MemberBottomNav() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-[#222222] flex z-50">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors relative ${
              active ? 'text-[#D4AF37]' : 'text-[#F5F5F0]/50 hover:text-[#F5F5F0]'
            }`}
          >
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#D4AF37] rounded-full" />
            )}
            <Icon size={20} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
