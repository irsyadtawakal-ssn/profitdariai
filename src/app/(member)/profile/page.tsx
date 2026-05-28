import { createServerClient } from '@/lib/supabase/server'
import { isMembershipActive } from '@/lib/membership'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { LogoutButton } from '@/components/member/LogoutButton'

export default async function ProfilePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: transactions }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, email, membership_expires_at')
      .eq('id', user!.id)
      .single(),
    supabase
      .from('transactions')
      .select('id, amount, payment_method, status, paid_at, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const isActive = isMembershipActive({ membership_expires_at: profile?.membership_expires_at ?? null })
  const expiryLabel = profile?.membership_expires_at
    ? format(new Date(profile.membership_expires_at), 'd MMMM yyyy', { locale: id })
    : null

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : (profile?.email?.[0] ?? 'M').toUpperCase()

  const daysLeft = profile?.membership_expires_at && isActive
    ? Math.ceil((new Date(profile.membership_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#F5F5F0] mb-8">Profil Saya</h1>

      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0">
          <span className="text-[#D4AF37] font-bold text-lg">{initials}</span>
        </div>
        <div>
          <p className="text-[#F5F5F0] font-semibold">{profile?.full_name ?? '-'}</p>
          <p className="text-[#888888] text-sm">{profile?.email}</p>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 mb-6">
        <h2 className="text-[#F5F5F0] font-semibold mb-4">Status Membership</h2>
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-red-900/30 text-red-400'
            }`}
          >
            {isActive ? 'Aktif' : 'Expired'}
          </span>
          {expiryLabel && (
            <span className="text-[#888888] text-sm">
              {isActive ? `Sampai ${expiryLabel}` : `Berakhir ${expiryLabel}`}
            </span>
          )}
        </div>
        {(daysLeft !== null && daysLeft <= 30) || !isActive ? (
          <a
            href="/checkout"
            className="inline-block mt-2 px-4 py-2 bg-[#D4AF37] text-[#0A0A0A] text-sm font-semibold rounded-lg hover:bg-[#D4AF37]/90 transition-colors"
          >
            Perpanjang Membership
          </a>
        ) : null}
      </div>

      {transactions && transactions.length > 0 && (
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 mb-6">
          <h2 className="text-[#F5F5F0] font-semibold mb-4">Riwayat Transaksi</h2>
          <div className="flex flex-col gap-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-[#1A1A1A] last:border-0">
                <div>
                  <p className="text-[#F5F5F0] text-sm font-medium">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(tx.amount)}
                  </p>
                  <p className="text-[#555555] text-xs">
                    {tx.payment_method} · {format(new Date(tx.created_at), 'd MMM yyyy', { locale: id })}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    tx.status === 'PAID' ? 'bg-green-900/30 text-green-400' :
                    tx.status === 'UNPAID' ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-[#1A1A1A] text-[#555555]'
                  }`}
                >
                  {tx.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <LogoutButton />
    </div>
  )
}
