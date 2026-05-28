'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-[#F5F5F0]">
        <h2 className="text-2xl font-bold mb-4">Terjadi kesalahan</h2>
        <p className="text-[#888888] mb-6">Tim kami sudah diberitahu. Silakan coba lagi.</p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-[#D4AF37] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#C49B2E] transition-colors"
        >
          Coba lagi
        </button>
      </body>
    </html>
  )
}
