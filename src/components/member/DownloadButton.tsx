'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface DownloadButtonProps {
  ebookId: string
}

export function DownloadButton({ ebookId }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    setLoading(true)
    setError(null)
    try {
      // Cek auth + membership dulu tanpa follow redirect ke GDrive (hindari CORS)
      const res = await fetch(`/api/ebook/download/${ebookId}`, {
        redirect: 'manual', // jangan follow redirect — kita hanya mau cek statusnya
      })

      // opaque response (status 0) = redirect berhasil → artinya user authorized
      // status 401/403 = unauthorized / no membership
      if (res.status === 401) {
        setError('Kamu harus login untuk mengunduh.')
        return
      }
      if (res.status === 403) {
        setError('Membership diperlukan untuk mengunduh ebook ini.')
        return
      }
      if (res.status !== 0 && !res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Gagal mengunduh, coba lagi.')
        return
      }

      // Authorized → buka URL download di tab baru (browser handle redirect ke GDrive)
      window.open(`/api/ebook/download/${ebookId}`, '_blank')
    } catch {
      setError('Gagal mengunduh, coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        onClick={handleDownload}
        loading={loading}
        className="gap-2"
      >
        <Download size={16} aria-hidden="true" />
        Download PDF
      </Button>
      {error && (
        <p role="alert" className="text-red-400 text-xs mt-2">
          {error}
        </p>
      )}
    </div>
  )
}
