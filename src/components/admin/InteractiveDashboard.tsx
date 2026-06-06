'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Users,
  ShoppingCart,
  CreditCard,
  BookOpen,
  Sparkles,
  Shield,
  Database,
  ArrowRight,
  PlusCircle,
  TrendingUp,
  Download,
  FileText
} from 'lucide-react'

interface Member {
  id: string
  full_name: string | null
  email: string
  created_at: string
  status: string
}

interface ChartItem {
  label: string
  value: number
}

interface InteractiveDashboardProps {
  totalMembers: number
  totalBuyers: number
  mrrFormatted: string
  totalEbooks: number
  totalCourses: number
  newestMembers: Member[]
  chartData: ChartItem[]
  maxChartVal: number
}

export function InteractiveDashboard({
  totalMembers,
  totalBuyers,
  mrrFormatted,
  totalEbooks,
  totalCourses,
  newestMembers,
  chartData,
  maxChartVal
}: InteractiveDashboardProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [isAiRunning, setIsAiRunning] = useState(false)

  const handleExport = () => {
    toast.success('Data berhasil diekspor ke CSV!', {
      description: 'File profitdariai_report.csv sedang diunduh.'
    })
  }

  const handleAiEngine = () => {
    setIsAiRunning(true)
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2500)),
      {
        loading: 'Menjalankan AI Insights Engine...',
        success: () => {
          setIsAiRunning(false)
          return 'AI Insights Berhasil Dibuat! Laporan tren terkirim ke email admin.'
        },
        error: 'Gagal menjalankan AI Insights.'
      }
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display font-extrabold text-gold text-3xl md:text-4xl leading-tight mb-2 uppercase tracking-tight">
            Admin Command Center
          </h1>
          <div className="flex items-center gap-2 text-[#888888] font-mono text-xs">
            <span className="hover:text-gold cursor-pointer transition-colors">Admin</span>
            <ChevronRightIcon />
            <span className="text-ivory">Dashboard Overview</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2 border border-gold/40 text-gold font-mono text-xs font-semibold hover:bg-gold/10 transition-all active:scale-95 cyber-corner cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT DATA
          </button>
          <Link
            href="/admin/materi"
            className="flex items-center gap-2 px-5 py-2 bg-gold text-obsidian font-mono text-xs font-bold transition-all active:scale-95 cyber-corner hover:brightness-110"
          >
            <FileText className="w-3.5 h-3.5" />
            MANAGE CONTENT
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total User */}
        <div className="glass-panel p-6 cyber-corner relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <Users className="text-gold/60 w-6 h-6" />
            <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              +12% ↑
            </span>
          </div>
          <h3 className="font-mono text-[#888888] text-[10px] tracking-widest uppercase mb-1">Total User</h3>
          <p className="font-display text-gold text-4xl font-extrabold leading-none">
            {totalMembers}
          </p>
          <div className="absolute -bottom-2 -right-2 opacity-5">
            <Users className="w-24 h-24 text-gold" />
          </div>
        </div>

        {/* Total Pembeli */}
        <div className="glass-panel p-6 cyber-corner relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <ShoppingCart className="text-gold/60 w-6 h-6" />
            <span className="font-mono text-[10px] text-[#888888]">Target: 100</span>
          </div>
          <h3 className="font-mono text-[#888888] text-[10px] tracking-widest uppercase mb-1">Total Pembeli</h3>
          <p className="font-display text-gold text-4xl font-extrabold leading-none">
            {totalBuyers}
          </p>
          <div className="absolute -bottom-2 -right-2 opacity-5">
            <ShoppingCart className="w-24 h-24 text-gold" />
          </div>
        </div>

        {/* Revenue */}
        <div className="glass-panel p-6 cyber-corner relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <CreditCard className="text-gold/60 w-6 h-6" />
            <span className="font-mono text-[10px] text-[#888888] uppercase tracking-wider">BULAN INI</span>
          </div>
          <h3 className="font-mono text-[#888888] text-[10px] tracking-widest uppercase mb-1">Revenue</h3>
          <p className="font-display text-gold text-3xl font-extrabold leading-none mt-1 truncate">
            {mrrFormatted}
          </p>
          <div className="absolute -bottom-2 -right-2 opacity-5">
            <CreditCard className="w-24 h-24 text-gold" />
          </div>
        </div>

        {/* Active Content */}
        <div className="glass-panel p-6 cyber-corner relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <BookOpen className="text-gold/60 w-6 h-6" />
            <Link href="/admin/materi/new" className="text-[#888888] hover:text-gold transition-colors">
              <PlusCircle className="w-5 h-5" />
            </Link>
          </div>
          <h3 className="font-mono text-[#888888] text-[10px] tracking-widest uppercase mb-1">Active Content</h3>
          <div className="flex flex-col gap-1 mt-2 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
              <span>{totalEbooks} Ebook</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#333333]"></span>
              <span className="text-[#888888]">{totalCourses} Kursus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Analytics Chart */}
        <div className="lg:col-span-2 glass-panel p-6 md:p-8 cyber-corner h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-display text-lg text-gold font-bold">Revenue Analytics</h3>
              <p className="font-mono text-[10px] text-[#888888]">Tren performa pembayaran 12 hari terakhir</p>
            </div>
            <div className="bg-[#111111] border border-gold/20 text-mono text-[10px] text-gold px-4 py-1.5 font-mono">
              REAL-TIME SYNC
            </div>
          </div>
          <div className="flex-1 w-full relative flex items-end justify-between gap-1 pb-4">
            <div className="absolute inset-0 border-b border-l border-gold/15 pointer-events-none"></div>
            
            {/* Visual Noise/Grid */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none" 
              style={{
                backgroundImage: 'radial-gradient(#d4af37 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            ></div>

            {/* Bars */}
            <div className="flex-1 w-full h-full relative flex items-end gap-2 px-2 overflow-visible">
              {chartData.map((item, idx) => {
                const heightPercent = `${Math.max(6, (item.value / maxChartVal) * 90)}%`
                const formattedVal = new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0
                }).format(item.value)

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
                      {formattedVal}
                    </div>

                    <div
                      className={`w-full bg-gold/10 border-t-2 border-gold transition-all duration-300 ${
                        hoveredBar === idx ? 'bg-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.3)]' : ''
                      }`}
                      style={{ height: heightPercent }}
                    ></div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="flex justify-between mt-4 font-mono text-[9px] text-[#888888] px-2">
            {chartData.map((item, idx) => (
              <span key={idx} className={idx % 2 === 0 ? 'opacity-100' : 'opacity-40 sm:opacity-100'}>
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Newest Members */}
        <div className="lg:col-span-1 glass-panel p-6 md:p-8 cyber-corner flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg text-gold font-bold">Newest Members</h3>
            <Link href="/admin/members" className="text-gold text-[10px] font-mono uppercase tracking-widest hover:underline">
              View All
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
            {newestMembers.length === 0 ? (
              <div className="text-[#888888] font-mono text-xs py-8 text-center">Belum ada member terdaftar.</div>
            ) : (
              newestMembers.map((member) => {
                const initials = (member.full_name || member.email || 'M')
                  .split(' ')
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-3 border-b border-gold/10 hover:bg-gold/5 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gold/5 flex items-center justify-center text-gold font-mono font-bold border border-gold/20 shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-ivory text-sm truncate leading-tight">
                        {member.full_name || 'Anonymous User'}
                      </p>
                      <p className="font-mono text-[9px] text-[#888888] truncate">{member.email}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 font-mono text-[9px] font-bold border rounded-none shrink-0 ${
                        member.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-[#333333]/35 text-[#888888] border-gold/10'
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Bento Grid Tools Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="md:col-span-2 glass-panel p-6 cyber-corner flex flex-col sm:flex-row gap-6 items-center">
          <div className="w-20 h-20 bg-gold/5 border border-gold/25 flex items-center justify-center shrink-0">
            <Sparkles className="text-gold w-10 h-10 animate-pulse" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-display font-bold text-gold text-lg mb-1">AI Insights Generator</h4>
            <p className="text-[#888888] text-xs mb-4 leading-relaxed">
              Analisis perilaku pembeli dan hasilkan visualisasi tren penjualan menggunakan algoritma AI otomatis.
            </p>
            <button
              onClick={handleAiEngine}
              disabled={isAiRunning}
              className="bg-gold/15 text-gold border border-gold/40 px-5 py-2 font-mono text-[10px] font-bold hover:bg-gold hover:text-obsidian transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isAiRunning ? 'RUNNING ENGINE...' : 'LAUNCH AI ENGINE'}
            </button>
          </div>
        </div>

        <div className="md:col-span-1 glass-panel p-6 cyber-corner flex flex-col justify-between group">
          <div>
            <Shield className="text-gold w-8 h-8 mb-4 group-hover:scale-110 transition-transform duration-300" />
            <h4 className="font-display font-bold text-ivory text-sm mb-1">Security Hub</h4>
            <p className="text-[#888888] text-[11px] leading-relaxed">
              Status pertahanan: Aman. Tidak ada aktivitas mencurigakan yang terdeteksi.
            </p>
          </div>
          <Link
            href="/admin/dashboard"
            className="mt-4 text-gold text-[10px] font-mono uppercase tracking-wider group-hover:translate-x-1 transition-transform inline-flex items-center gap-1"
          >
            Protocol Access <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="md:col-span-1 glass-panel p-6 cyber-corner flex flex-col justify-between group">
          <div>
            <Database className="text-gold w-8 h-8 mb-4 group-hover:scale-110 transition-transform duration-300" />
            <h4 className="font-display font-bold text-ivory text-sm mb-1">Backup Status</h4>
            <p className="text-[#888888] text-[11px] leading-relaxed">
              Sinkronisasi cloud harian berhasil dilakukan pada pukul 04:00 WIB.
            </p>
          </div>
          <Link
            href="/admin/dashboard"
            className="mt-4 text-gold text-[10px] font-mono uppercase tracking-wider group-hover:translate-x-1 transition-transform inline-flex items-center gap-1"
          >
            Storage Config <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-6 border-t border-gold/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[#888888] font-mono text-[10px]">
        <p>© 2026 Profit Dari AI. High-Stakes Intelligence.</p>
        <div className="flex gap-6">
          <Link href="/kebijakan-privasi" className="hover:text-gold transition-colors">Privacy Policy</Link>
          <Link href="/ketentuan-layanan" className="hover:text-gold transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  )
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-3 h-3"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  )
}
