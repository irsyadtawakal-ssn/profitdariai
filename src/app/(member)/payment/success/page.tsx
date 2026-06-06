'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const [ebookCount, setEbookCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOwned() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const { count } = await supabase
          .from('user_ebooks')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)

        setEbookCount(count ?? 0)
      } catch {
        setError('Gagal memuat data. Silakan refresh halaman.')
      } finally {
        setLoading(false)
      }
    }
    fetchOwned()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-[#D4AF37]/20 border-2 border-[#D4AF37] flex items-center justify-center mx-auto mb-6">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[#F5F5F0] mb-2">Pembayaran Berhasil!</h1>
        <p className="text-[#888888] mb-2">
          Produk kamu sudah aktif dan siap diakses.
        </p>

        {error && (
          <p role="alert" className="text-red-400 text-sm mb-4">{error}</p>
        )}

        {!loading && !error && ebookCount !== null && ebookCount > 0 && (
          <div className="flex items-center justify-center gap-2 mb-8 text-[#D4AF37] text-sm font-medium font-mono">
            <BookOpen size={14} />
            <span>{ebookCount} produk tersedia di Library kamu</span>
          </div>
        )}

        <Button
          variant="primary"
          loading={loading}
          onClick={() => router.push('/materi')}
          className="px-8"
        >
          Buka Library →
        </Button>
      </div>
    </div>
  )
}
