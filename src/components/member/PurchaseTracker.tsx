'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { fbpixelTrack } from '@/components/MetaPixel'

function Tracker() {
  const params = useSearchParams()

  useEffect(() => {
    if (params.get('payment') !== 'success') return
    const ref = params.get('ref')
    if (!ref) return

    // Cegah dobel-fire saat reload halaman sukses.
    const flagKey = `pda_purchase_${ref}`
    if (sessionStorage.getItem(flagKey)) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/payment/status?ref=${encodeURIComponent(ref)}`)
        if (!res.ok) return
        const { status, amount } = await res.json()
        if (cancelled || status !== 'PAID') return

        // eventID = merchant_ref → dedup dengan CAPI server-side di webhook.
        fbpixelTrack('Purchase', { value: amount, currency: 'IDR' }, ref)
        sessionStorage.setItem(flagKey, '1')
      } catch {
        // tracking gagal — abaikan diam-diam
      }
    })()

    return () => {
      cancelled = true
    }
  }, [params])

  return null
}

export function PurchaseTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  )
}
