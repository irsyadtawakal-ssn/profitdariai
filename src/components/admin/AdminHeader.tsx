'use client'

import Link from 'next/link'
import { Bell, Search, User } from 'lucide-react'

interface AdminHeaderProps {
  user: {
    email: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-20 z-40 bg-obsidian/85 backdrop-blur-md border-b border-gold/20">
      <div className="flex justify-between items-center h-full px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/admin/dashboard" className="font-display text-gold tracking-tighter text-2xl font-extrabold hover:opacity-90 transition-opacity">
            Profit Dari AI
          </Link>
          <div className="hidden md:flex items-center bg-[#111111] px-4 py-2 border border-gold/15 w-[320px] focus-within:border-gold/50 transition-colors">
            <Search className="text-[#888888] mr-2 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari data..."
              className="bg-transparent border-none outline-none focus:ring-0 text-sm font-mono w-full text-ivory placeholder:text-[#888888]/40"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-gold hover:bg-gold/10 p-2 transition-all cursor-pointer active:scale-95 relative rounded-none">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold animate-pulse"></span>
          </button>
          <div className="flex items-center gap-3 pl-3 border-l border-gold/20">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-ivory">{user?.full_name || 'Admin'}</div>
              <div className="text-[10px] text-[#888888] font-mono">{user?.email || 'admin@profitdariai.com'}</div>
            </div>
            <Link href="/profile" className="text-gold hover:bg-gold/10 p-2 transition-all cursor-pointer active:scale-95 border border-gold/20">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
