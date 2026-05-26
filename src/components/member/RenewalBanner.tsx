'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { getDaysUntilExpiry } from '@/lib/membership'

const DISMISSED_KEY = 'renewal-banner-dismissed'

interface RenewalBannerProps {
  expiresAt: string
}

export function RenewalBanner({ expiresAt }: RenewalBannerProps) {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY) !== 'true') {
      setDismissed(false)
    }
  }, [])

  const days = getDaysUntilExpiry({ membership_expires_at: expiresAt })

  if (dismissed || days === null || days > 14 || days <= 0) return null

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, 'true')
    setDismissed(true)
  }

  return (
    <div
      role="alert"
      className="bg-amber-900/50 border-b border-amber-600/40 px-4 py-2.5 flex items-center justify-between gap-4"
    >
      <p className="text-amber-200 text-sm">
        Membership kamu berakhir dalam <strong>{days} hari</strong>.{' '}
        <Link href="/checkout" className="underline underline-offset-2 hover:text-white">
          Perpanjang Sekarang →
        </Link>
      </p>
      <button
        onClick={dismiss}
        aria-label="Tutup notifikasi"
        className="text-amber-400 hover:text-white flex-shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  )
}
