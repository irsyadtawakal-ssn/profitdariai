import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { isMembershipActive } from '@/lib/membership'
import { getPaymentChannels } from '@/lib/tripay/client'
import { CheckoutForm } from '@/components/member/CheckoutForm'

export default async function CheckoutPage() {
  const [supabase, channelsRes] = await Promise.all([
    createServerClient(),
    getPaymentChannels().catch(() => ({ success: false, data: [] })),
  ])

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('membership_expires_at')
      .eq('id', user.id)
      .single()

    if (profile && isMembershipActive(profile)) {
      redirect('/dashboard')
    }
  }

  const channelIcons: Record<string, string> = {}
  if (channelsRes.success) {
    for (const ch of channelsRes.data) {
      if (ch.icon_url) channelIcons[ch.code] = ch.icon_url
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#F5F5F0] mb-2">Bergabung Sekarang</h1>
          <p className="text-[#888888] text-sm">Akses penuh ke semua kursus & ebook — Rp 199.000 (Sekali Bayar)</p>
        </div>
        <CheckoutForm channelIcons={channelIcons} />
      </div>
    </div>
  )
}
