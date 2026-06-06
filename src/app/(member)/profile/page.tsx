import { createServerClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { LogoutButton } from '@/components/member/LogoutButton'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { KeyRound, ShieldCheck, Settings, User2, Wallet, Calendar, Mail, FileText } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: transactions }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, created_at')
      .eq('id', user!.id)
      .single(),
    supabase
      .from('transactions')
      .select('id, amount, payment_method, status, paid_at, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const joinedLabel = profile?.created_at
    ? format(new Date(profile.created_at), 'MMM yyyy', { locale: id }).toUpperCase()
    : 'JAN 2024'

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : (profile?.email?.[0] ?? 'M').toUpperCase()

  const uid = `AI-${profile?.id?.slice(0, 8).toUpperCase() ?? 'MEMBER'}`

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pt-8">
      {/* Page Title */}
      <div>
        <span className="font-mono text-[9px] text-[#D4AF37] tracking-[0.2em] block mb-2 uppercase">AKUN PENGGUNA</span>
        <h2 className="text-2xl md:text-3xl font-black text-white leading-none tracking-tight font-display">Profil Saya</h2>
      </div>

      {/* Profile Header Section */}
      <section>
        <div className="glass-panel rounded-none border border-[#D4AF37]/20 p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden bg-[#0E0E0E]">
          {/* Atmospheric Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Cybernetic Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 md:w-28 md:h-28 p-0.5 bg-gradient-to-br from-[#D4AF37] via-[#D4AF37]/20 to-[#D4AF37] cyber-corner">
              <div className="w-full h-full bg-[#110E07] flex items-center justify-center cyber-corner">
                <span className="text-[#D4AF37] font-black text-3xl font-display">{initials}</span>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="flex-grow text-center md:text-left space-y-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 mb-2">
                <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-none animate-pulse" />
                <span className="font-mono text-[9px] text-[#D4AF37] tracking-widest uppercase font-bold">
                  MEMBER AKTIF
                </span>
              </div>
              <h3 className="font-display text-xl md:text-2xl font-black text-white">{profile?.full_name ?? 'Elite Member'}</h3>
              <p className="font-mono text-[#888888] text-xs mt-1 flex items-center justify-center md:justify-start gap-1.5">
                <span>UID:</span>
                <span className="text-white">{uid}</span>
              </p>
            </div>

            {/* Micro Stats */}
            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
              <div className="text-left px-4 border-l border-[#D4AF37]/30">
                <p className="font-mono text-[9px] text-[#888888] tracking-wider uppercase">Status Akses</p>
                <p className="font-mono text-sm text-[#D4AF37] font-bold">AKTIF</p>
              </div>
              <div className="text-left px-4 border-l border-[#D4AF37]/30">
                <p className="font-mono text-[9px] text-[#888888] tracking-wider uppercase">Tanggal Join</p>
                <p className="font-mono text-sm text-[#D4AF37] font-bold">{joinedLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Layout for Stats and Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Learning Stats & Security */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Akses Card */}
          <div className="glass-panel rounded-none p-6 bg-[#0E0E0E]">
            <h4 className="font-display text-sm font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-3 bg-[#D4AF37]" />
              Status Akses
            </h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#222222]/50">
                <span className="text-xs text-[#888888]">Status Akses</span>
                <Badge variant="gold">Aktif</Badge>
              </div>
              <div className="pt-2">
                <Link
                  href="/marketplace"
                  className="w-full bg-[#D4AF37] text-[#0A0A0A] font-bold py-3 text-[10px] tracking-wider font-mono block text-center cyber-corner hover:brightness-110 active:scale-95 transition-all"
                >
                  TAMBAH PRODUK
                </Link>
              </div>
            </div>
          </div>

          {/* Security Panel */}
          <div className="glass-panel rounded-none p-6 border-red-900/20 bg-red-950/5">
            <h4 className="font-display text-sm font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-400" />
              Keamanan Akun
            </h4>
            <p className="text-xs text-[#888888] leading-relaxed mb-6 font-sans">
              Segera atur ulang sandi jika Anda mendeteksi aktivitas mencurigakan pada sesi login Anda.
            </p>
            <Link 
              href="/reset-password"
              className="w-full py-3 border border-red-500/20 text-red-400 text-[10px] font-bold font-mono tracking-wider hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound size={13} />
              GANTI PASSWORD
            </Link>
          </div>
        </div>

        {/* Right Column: Account Settings & Purchase History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Settings List */}
          <div className="glass-panel rounded-none p-6 bg-[#0E0E0E]">
            <h4 className="font-display text-sm font-bold text-white mb-6 flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#D4AF37]" />
              Pengaturan Akun
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 hover:bg-white/5 border border-transparent hover:border-[#D4AF37]/20 transition-all rounded-none cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-none bg-[#110E07] border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                    <User2 size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white font-display">Nama Lengkap</p>
                    <p className="text-[10px] text-[#888888] font-mono uppercase mt-0.5">{profile?.full_name ?? '-'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-white/5 border border-transparent hover:border-[#D4AF37]/20 transition-all rounded-none cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-none bg-[#110E07] border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white font-display">Email Terdaftar</p>
                    <p className="text-[10px] text-[#888888] font-mono mt-0.5">{profile?.email ?? '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase History */}
          {transactions && transactions.length > 0 && (
            <div className="glass-panel rounded-none p-6 bg-[#0E0E0E]">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-display text-sm font-bold text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#D4AF37]" />
                  Riwayat Pembelian
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-[#222222] text-[#888888] font-mono text-[9px] uppercase tracking-wider">
                    <tr>
                      <th className="pb-3 font-normal">Metode</th>
                      <th className="pb-3 font-normal">Tanggal</th>
                      <th className="pb-3 font-normal">Status</th>
                      <th className="pb-3 font-normal text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222222]/30 text-xs">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5">
                          <p className="font-bold text-white font-display">{tx.payment_method ?? 'Transfer'}</p>
                          <p className="text-[9px] text-[#555555] font-mono">TX-{tx.id.slice(0, 8).toUpperCase()}</p>
                        </td>
                        <td className="py-3.5 text-[#888888] font-mono">
                          {format(new Date(tx.created_at), 'dd MMM yyyy', { locale: id }).toUpperCase()}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-bold font-mono tracking-wider ${
                              tx.status === 'PAID'
                                ? 'bg-green-950/20 text-green-400 border border-green-500/20'
                                : tx.status === 'UNPAID'
                                ? 'bg-yellow-950/20 text-yellow-400 border border-yellow-500/20'
                                : 'bg-[#1A1A1A] text-[#888888]'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-mono text-[#D4AF37] font-semibold">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            maximumFractionDigits: 0,
                          }).format(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Action Area */}
      <div className="flex justify-end pt-4">
        <LogoutButton />
      </div>
    </div>
  )
}
