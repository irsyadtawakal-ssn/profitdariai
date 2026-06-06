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
      const res = await fetch(`/api/ebook/download/${ebookId}`)
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          setError('Kamu harus login untuk mengunduh.')
        } else if (res.status === 403) {
          setError('Kamu belum memiliki ebook ini. Beli di Marketplace terlebih dahulu.')
        } else {
          setError(data.error ?? 'Gagal mengunduh, coba lagi.')
        }
        return
      }

      // Arahkan di tab yang sama — browser download otomatis tanpa buka tab baru
      window.location.href = data.url
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
