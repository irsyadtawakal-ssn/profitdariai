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
      const res = await fetch(`/api/ebook/download/${ebookId}`, { redirect: 'follow' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Gagal mengunduh, coba lagi.')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'ebook.pdf'
      a.click()
      URL.revokeObjectURL(url)
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
