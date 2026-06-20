'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'
import { trackCheckoutComplete } from '@/lib/pixel/pixel-events'
import { fbpixelTrack } from '@/components/MetaPixel'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [ebookCount, setEbookCount] = useState<number | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOwnedAndTrack() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { count } = await supabase
            .from('user_ebooks')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)

          setEbookCount(count ?? 0)
        } else {
          setIsGuest(true)
        }

        // Track checkout_complete & Meta Pixel Purchase event
        const merchantRef = searchParams.get('ref')
        if (merchantRef) {
          try {
            // Fetch transaction from safe status API (works for both guests & members without RLS issues)
            const res = await fetch(`/api/payment/status?ref=${encodeURIComponent(merchantRef)}`)
            if (res.ok) {
              const transaction = await res.json()
              
              if (transaction && transaction.status === 'PAID') {
                // 1. Send checkout_complete event to DB
                await trackCheckoutComplete({
                  transaction_id: transaction.tripay_reference,
                  amount: transaction.amount,
                })

                // 2. Fire Meta Pixel Purchase event (browser-side) with deduplication check
                const flagKey = `pda_purchase_${merchantRef}`
                if (!sessionStorage.getItem(flagKey)) {
                  fbpixelTrack('Purchase', { value: transaction.amount, currency: 'IDR' }, merchantRef)
                  sessionStorage.setItem(flagKey, '1')
                }
              }
            }
          } catch (trackError) {
            console.error('Failed to track checkout success events:', trackError)
            // Don't fail the page if tracking fails
          }
        }
      } catch {
        setError('Gagal memuat data. Silakan refresh halaman.')
      } finally {
        setLoading(false)
      }
    }
    fetchOwnedAndTrack()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-[#D4AF37]/20 border-2 border-[#D4AF37] flex items-center justify-center mx-auto mb-6">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[#F5F5F0] mb-2">Pembayaran Berhasil!</h1>
        
        {isGuest ? (
          <p className="text-[#888888] text-sm mb-6 leading-relaxed">
            Akun kamu telah dibuat secara otomatis. Silakan cek inbox/spam email kamu untuk melakukan set password dan mengakses produk.
          </p>
        ) : (
          <p className="text-[#888888] text-sm mb-6 leading-relaxed">
            Produk kamu sudah aktif dan siap diakses.
          </p>
        )}

        {error && (
          <p role="alert" className="text-red-400 text-sm mb-4">{error}</p>
        )}

        {!loading && !error && !isGuest && ebookCount !== null && ebookCount > 0 && (
          <div className="flex items-center justify-center gap-2 mb-8 text-[#D4AF37] text-sm font-medium font-mono">
            <BookOpen size={14} />
            <span>{ebookCount} produk tersedia di Library kamu</span>
          </div>
        )}

        <Button
          variant="primary"
          loading={loading}
          onClick={() => router.push(isGuest ? '/login' : '/materi')}
          className="px-8"
        >
          {isGuest ? 'Masuk ke Akun Saya →' : 'Buka Library →'}
        </Button>
      </div>
    </div>
  )
}
