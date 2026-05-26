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
        setError(data.error ?? 'Gagal mengunduh, coba lagi.')
        return
      }
      window.open(data.url, '_blank')
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
