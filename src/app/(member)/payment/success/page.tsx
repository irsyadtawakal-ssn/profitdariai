'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        const { data } = await supabase
          .from('profiles')
          .select('membership_expires_at')
          .eq('id', user.id)
          .single()
        setExpiresAt(data?.membership_expires_at ?? null)
      } catch {
        setError('Gagal memuat data. Silakan refresh halaman.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [router])

  const expiryLabel = expiresAt
    ? format(new Date(expiresAt), 'd MMMM yyyy', { locale: id })
    : null

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37] flex items-center justify-center mx-auto mb-6 animate-bounce-once">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[#F5F5F0] mb-2">Pembayaran Berhasil!</h1>
        <p className="text-[#888888] mb-2">
          Selamat datang di profitdariai. Akses kamu sudah aktif.
        </p>

        {error && (
          <p role="alert" className="text-red-400 text-sm mb-4">{error}</p>
        )}

        {!loading && !error && expiryLabel && (
          <p className="text-[#D4AF37] text-sm font-medium mb-8">
            Membership aktif sampai {expiryLabel}
          </p>
        )}

        <Button
          variant="primary"
          loading={loading}
          onClick={() => router.push('/dashboard')}
          className="px-8"
        >
          Mulai Belajar →
        </Button>
      </div>
    </div>
  )
}
