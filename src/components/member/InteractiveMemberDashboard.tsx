'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  BookOpen,
  GraduationCap,
  ShieldAlert,
  Sparkles,
  ShieldCheck,
  Terminal,
  ArrowRight,
  ChevronRight,
  Download,
  Flame,
  Lock,
  Unlock,
  Plus
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Member {
  full_name: string | null
  email: string
}

interface FeaturedMateri {
  id: string
  slug: string
  title: string
  category: string
  cover_url: string | null
  description: string | null
}

interface NewestMateri {
  id: string
  slug: string
  title: string
  category: string
  cover_url: string | null
}

interface InteractiveMemberDashboardProps {
  user: Member
  ownedEbooksCount: number
  totalEbooks: number
  totalCourses: number
  featuredMateri: FeaturedMateri | null
  newestMateris: NewestMateri[]
  ownedEbookIds: string[]
}

const WEEKLY_ACTIVITY = [
  { label: 'SEN', value: 45 },
  { label: 'SEL', value: 90 },
  { label: 'RAB', value: 120 },
  { label: 'KAM', value: 60 },
  { label: 'JUM', value: 180 },
  { label: 'SAB', value: 240 },
  { label: 'MIN', value: 150 }
]

export function InteractiveMemberDashboard({
  user,
  ownedEbooksCount,
  totalEbooks,
  totalCourses,
  featuredMateri,
  newestMateris,
  ownedEbookIds
}: InteractiveMemberDashboardProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [isPromptGenerating, setIsPromptGenerating] = useState(false)

  const handlePromptOptimizer = () => {
    setIsPromptGenerating(true)
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Menghubungkan ke AI Mainframe...',
        success: () => {
          setIsPromptGenerating(false)
          return 'AI Copilot Aktif! Silakan periksa tab Library untuk mengakses generator.'
        },
        error: 'Gagal menghubungkan ke AI.'
      }
    )
  }

  // Calculate maximum activity value for scaling
  const maxActivityVal = Math.max(...WEEKLY_ACTIVITY.map(a => a.value), 1)

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gold/10">
        <div>
          <h1 className="font-display font-extrabold text-gold text-3xl md:text-4xl leading-tight mb-2 uppercase tracking-tight">
            Member Command Center
          </h1>
          <div className="flex items-center gap-2 text-[#888888] font-mono text-xs">
            <span className="hover:text-gold cursor-pointer transition-colors">Member</span>
            <ChevronRight className="w-3 h-3 text-[#888888]" />
            <span className="text-ivory">Dashboard Overview</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/materi"
            className="flex items-center gap-2 px-5 py-2.5 border border-gold/40 text-gold font-mono text-xs font-semibold hover:bg-gold/10 transition-all active:scale-95 cyber-corner"
          >
            <BookOpen className="w-3.5 h-3.5" />
            BUKA LIBRARY
          </Link>
          <Link
            href="/marketplace"
            className="flex items-center gap-2 px-5 py-2.5 bg-gold text-obsidian font-mono text-xs font-bold transition-all active:scale-95 cyber-corner hover:brightness-110"
          >
            <Plus className="w-3.5 h-3.5" />
            BELI ASET BARU
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Koleksi */}
        <div className="glass-panel p-6 cyber-corner relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <BookOpen className="text-gold/60 w-6 h-6" />
            <span className="font-mono text-[10px] text-gold">
              Akses: {ownedEbooksCount} / {totalEbooks}
            </span>
          </div>
          <h3 className="font-mono text-[#888888] text-[10px] tracking-widest uppercase mb-1">Koleksi Saya</h3>
          <p className="font-display text-gold text-4xl font-extrabold leading-none">
            {ownedEbooksCount} <span className="text-xs font-mono text-[#888888]">Ebook</span>
          </p>
          <div className="absolute -bottom-2 -right-2 opacity-5">
            <BookOpen className="w-24 h-24 text-gold" />
          </div>
        </div>

        {/* Kelas Aktif */}
        <div className="glass-panel p-6 cyber-corner relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <GraduationCap className="text-gold/60 w-6 h-6" />
            <span className="font-mono text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
              Segera Hadir
            </span>
          </div>
          <h3 className="font-mono text-[#888888] text-[10px] tracking-widest uppercase mb-1">Kelas Online</h3>
          <p className="font-display text-gold text-4xl font-extrabold leading-none">
            {totalCourses} <span className="text-xs font-mono text-[#888888]">Kelas</span>
          </p>
          <div className="absolute -bottom-2 -right-2 opacity-5">
            <GraduationCap className="w-24 h-24 text-gold" />
          </div>
        </div>

        {/* Status Akses */}
        <div className="glass-panel p-6 cyber-corner relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <ShieldCheck className="text-gold/60 w-6 h-6" />
            <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest font-bold">LIFETIME</span>
          </div>
          <h3 className="font-mono text-[#888888] text-[10px] tracking-widest uppercase mb-1">Status Akun</h3>
          <p className="font-display text-emerald-400 text-3xl font-extrabold leading-none mt-1">
            ACTIVE
          </p>
          <div className="absolute -bottom-2 -right-2 opacity-5">
            <ShieldCheck className="w-24 h-24 text-gold" />
          </div>
        </div>

        {/* Aset Tersedia */}
        <div className="glass-panel p-6 cyber-corner relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <Terminal className="text-gold/60 w-6 h-6" />
            <span className="font-mono text-[10px] text-[#888888] uppercase tracking-wider">LATEST VER</span>
          </div>
          <h3 className="font-mono text-[#888888] text-[10px] tracking-widest uppercase mb-1">Aset AI Tersedia</h3>
          <p className="font-display text-gold text-4xl font-extrabold leading-none">
            {totalEbooks} <span className="text-xs font-mono text-[#888888]">Aset</span>
          </p>
          <div className="absolute -bottom-2 -right-2 opacity-5">
            <Terminal className="w-24 h-24 text-gold" />
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Area (Materi Pilihan & Activity Chart) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Featured Materi */}
          <div>
            <h2 className="font-mono text-xs text-gold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold shrink-0" />
              Materi Pilihan Editor
            </h2>
            {featuredMateri ? (
              <Link href={ownedEbookIds.includes(featuredMateri.id) ? `/materi/${featuredMateri.slug}` : '/marketplace'} className="block group">
                <div className="relative overflow-hidden glass-panel p-6 flex flex-col md:flex-row gap-6 items-start cyber-corner">
                  {/* Left accent border */}
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-gold to-gold/20" />
                  
                  {/* Cover */}
                  <div className="w-28 h-36 bg-[#161616] border border-gold/25 relative overflow-hidden shrink-0">
                    {featuredMateri.cover_url ? (
                      <Image
                        src={featuredMateri.cover_url}
                        alt={featuredMateri.title}
                        fill
                        sizes="112px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1808] to-[#161208]">
                        <BookOpen className="w-8 h-8 text-gold/30" />
                      </div>
                    )}
                    {!ownedEbookIds.includes(featuredMateri.id) && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-gold" />
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="gold" className="text-[9px] uppercase font-mono">
                          {featuredMateri.category}
                        </Badge>
                        <span className="text-gold font-mono text-[9px] tracking-widest uppercase">
                          ★ RECOMMENDED
                        </span>
                      </div>
                      <h3 className="text-ivory font-display font-extrabold text-lg group-hover:text-gold transition-colors leading-snug mb-3">
                        {featuredMateri.title}
                      </h3>
                      {featuredMateri.description && (
                        <p className="text-[#888888] text-xs leading-relaxed line-clamp-3 mb-4">
                          {featuredMateri.description}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 bg-gold text-obsidian font-mono text-xs font-bold px-4 py-2 cyber-corner hover:brightness-110 active:scale-95 transition-all">
                        {ownedEbookIds.includes(featuredMateri.id) ? (
                          <>MULAI BELAJAR <ArrowRight className="w-3 h-3" /></>
                        ) : (
                          <>BELI AKSES SEKARANG <Lock className="w-3 h-3" /></>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="glass-panel p-8 flex items-center justify-center text-[#888888] text-xs font-mono cyber-corner">
                Materi pilihan belum dikonfigurasi.
              </div>
            )}
          </div>

          {/* Activity Tracker Chart */}
          <div className="glass-panel p-6 md:p-8 cyber-corner h-[320px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-md text-gold font-bold uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-gold shrink-0 animate-bounce" />
                  Mainframe Access Activity
                </h3>
                <p className="font-mono text-[10px] text-[#888888]">Waktu aktif belajar Anda (dalam menit) minggu ini</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] px-3 py-1 font-mono tracking-widest uppercase">
                STREAK: ON
              </div>
            </div>
            
            <div className="flex-1 w-full relative flex items-end justify-between gap-1 pb-4">
              <div className="absolute inset-0 border-b border-l border-gold/15 pointer-events-none"></div>
              
              {/* Noise overlay */}
              <div 
                className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                style={{
                  backgroundImage: 'radial-gradient(#d4af37 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              ></div>

              <div className="flex-1 w-full h-full relative flex items-end gap-3 px-2 overflow-visible">
                {WEEKLY_ACTIVITY.map((day, idx) => {
                  const heightPercent = `${Math.max(10, (day.value / maxActivityVal) * 85)}%`
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col justify-end items-center h-full relative group cursor-pointer"
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Tooltip */}
                      <div
                        className={`absolute -top-10 bg-gold text-obsidian px-2.5 py-1 text-[10px] font-mono font-bold z-10 whitespace-nowrap transition-opacity pointer-events-none ${
                          hoveredBar === idx ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        {day.value} Menit
                      </div>

                      <div
                        className={`w-full bg-gold/10 border-t-2 border-gold transition-all duration-300 ${
                          hoveredBar === idx ? 'bg-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.35)]' : ''
                        }`}
                        style={{ height: heightPercent }}
                      ></div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex justify-between mt-4 font-mono text-[9px] text-[#888888] px-2">
              {WEEKLY_ACTIVITY.map((day, idx) => (
                <span key={idx} className={hoveredBar === idx ? 'text-gold font-bold' : ''}>
                  {day.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Area (Newest Materials List) */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-mono text-xs text-gold uppercase tracking-[0.2em] mb-4">
            Rilisan Materi Terbaru
          </h2>
          <div className="glass-panel p-6 cyber-corner flex flex-col h-[525px] overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
              {newestMateris.length === 0 ? (
                <div className="text-[#888888] font-mono text-xs py-8 text-center">Belum ada materi terdaftar.</div>
              ) : (
                newestMateris.map((materi) => {
                  const isOwned = ownedEbookIds.includes(materi.id)
                  const linkHref = isOwned ? `/materi/${materi.slug}` : '/marketplace'

                  return (
                    <Link
                      key={materi.id}
                      href={linkHref}
                      className="flex items-center gap-4 p-3 border-b border-gold/10 hover:bg-gold/5 transition-colors group"
                    >
                      {/* Cover Thumbnail */}
                      <div className="w-12 h-16 bg-[#161616] border border-gold/15 shrink-0 relative overflow-hidden">
                        {materi.cover_url ? (
                          <Image
                            src={materi.cover_url}
                            alt={materi.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1808] to-[#161208]">
                            <BookOpen className="w-4 h-4 text-gold/30" />
                          </div>
                        )}
                        {!isOwned && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-gold/80" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Badge variant={isOwned ? 'gold' : 'muted'} className="text-[8px] mb-1 font-mono uppercase">
                          {materi.category}
                        </Badge>
                        <h4 className={`font-body font-semibold text-xs leading-snug line-clamp-2 transition-colors ${
                          isOwned ? 'text-ivory group-hover:text-gold' : 'text-[#888888] group-hover:text-ivory'
                        }`}>
                          {materi.title}
                        </h4>
                      </div>

                      {/* Access Icon Status */}
                      <div className="shrink-0">
                        {isOwned ? (
                          <Unlock className="w-4 h-4 text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <Lock className="w-4 h-4 text-gold/40 group-hover:text-gold transition-colors" />
                        )}
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
            <Link
              href="/materi"
              className="w-full text-center bg-gold/10 hover:bg-gold/20 text-gold font-mono text-[10px] tracking-widest font-bold py-3.5 border border-gold/30 hover:border-gold/60 transition-all cyber-corner mt-4 uppercase"
            >
              Lihat Katalog Lengkap →
            </Link>
          </div>
        </div>
      </div>

      {/* Bento Grid Tools Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        {/* AI Prompt Generator */}
        <div className="md:col-span-2 glass-panel p-6 cyber-corner flex flex-col sm:flex-row gap-6 items-center">
          <div className="w-20 h-20 bg-gold/5 border border-gold/25 flex items-center justify-center shrink-0">
            <Sparkles className="text-gold w-10 h-10 animate-pulse" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-display font-bold text-gold text-lg mb-1">AI Prompt Optimizer</h4>
            <p className="text-[#888888] text-xs mb-4 leading-relaxed">
              Tingkatkan kualitas output model AI Anda dengan generator prompt iklan dan copywriting bawaan.
            </p>
            <button
              onClick={handlePromptOptimizer}
              disabled={isPromptGenerating}
              className="bg-gold/15 text-gold border border-gold/40 px-5 py-2 font-mono text-[10px] font-bold hover:bg-gold hover:text-obsidian transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isPromptGenerating ? 'OPTIMIZING...' : 'OPEN AI PROMPTS'}
            </button>
          </div>
        </div>

        {/* Security Hub */}
        <div className="md:col-span-1 glass-panel p-6 cyber-corner flex flex-col justify-between group">
          <div>
            <ShieldCheck className="text-gold w-8 h-8 mb-4 group-hover:scale-110 transition-transform duration-300" />
            <h4 className="font-display font-bold text-ivory text-sm mb-1">Keamanan Enkripsi</h4>
            <p className="text-[#888888] text-[11px] leading-relaxed">
              Sesi aktif Anda diproteksi enkripsi TLS 1.3 dan didukung pertahanan cloud Supabase.
            </p>
          </div>
          <span
            className="mt-4 text-gold text-[10px] font-mono uppercase tracking-wider cursor-default inline-flex items-center gap-1"
          >
            Session Secured <Unlock className="w-3 h-3 text-emerald-400" />
          </span>
        </div>

        {/* Sync Status */}
        <div className="md:col-span-1 glass-panel p-6 cyber-corner flex flex-col justify-between group">
          <div>
            <Flame className="text-gold w-8 h-8 mb-4 group-hover:scale-110 transition-transform duration-300" />
            <h4 className="font-display font-bold text-ivory text-sm mb-1">Server Mainframe</h4>
            <p className="text-[#888888] text-[11px] leading-relaxed">
              Pembaruan materi disinkronkan langsung setiap kali admin merilis modul baru.
            </p>
          </div>
          <span
            className="mt-4 text-gold text-[10px] font-mono uppercase tracking-wider cursor-default inline-flex items-center gap-1"
          >
            Core Sync Active <ChevronRight className="w-3 h-3 text-gold" />
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-6 border-t border-gold/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[#888888] font-mono text-[10px]">
        <p>© 2026 Profit Dari AI. High-Stakes Intelligence.</p>
        <div className="flex gap-6">
          <Link href="/kebijakan-privasi" className="hover:text-gold transition-colors">Privacy Policy</Link>
          <Link href="/ketentuan-layanan" className="hover:text-gold transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  )
}
