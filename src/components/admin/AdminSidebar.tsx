'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Kursus', href: '/admin/kursus' },
  { label: 'Ebook', href: '/admin/ebook' },
  { label: 'Members', href: '/admin/members' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-52 flex-shrink-0 border-r border-[#1A1A1A] min-h-screen p-4">
      <div className="text-[#D4AF37] font-bold text-sm mb-6 px-2 tracking-widest">ADMIN</div>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname.startsWith(href)
                ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-medium'
                : 'text-[#888888] hover:text-[#F5F5F0] hover:bg-[#1A1A1A]'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
