'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { slugify } from '@/lib/landing/slug'
import { createLandingPage, updateLandingPage } from './actions'

export interface LandingPage {
  id: string
  slug: string
  title: string
  html: string
  published: boolean
}

interface LandingDialogProps {
  open: boolean
  onClose: () => void
  landing?: LandingPage
}

export function LandingDialog({ open, onClose, landing }: LandingDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(landing?.title ?? '')
  const [slug, setSlug] = useState(landing?.slug ?? '')
  const [html, setHtml] = useState(landing?.html ?? '')
  const [published, setPublished] = useState(landing?.published ?? false)
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!landing

  useEffect(() => {
    setTitle(landing?.title ?? '')
    setSlug(landing?.slug ?? '')
    setHtml(landing?.html ?? '')
    setPublished(landing?.published ?? false)
    setError(null)
  }, [open, landing])

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!isEdit) setSlug(slugify(val))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData()
    formData.set('title', title)
    formData.set('slug', slug)
    formData.set('html', html)
    formData.set('published', published ? 'true' : 'false')
    startTransition(async () => {
      try {
        if (isEdit) await updateLandingPage(landing!.id, formData)
        else await createLandingPage(formData)
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menyimpan.')
      }
    })
  }

  function handlePreview() {
    if (!html.trim()) return
    const encoded = btoa(html)
    const encodedSafe = encodeURIComponent(encoded)
    window.open(`/admin/landing/preview?html=${encodedSafe}`, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Landing Page' : 'Tambah Landing Page'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Judul</Label>
            <Input id="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            <p className="text-xs text-gray-400 mt-1">URL: /lp/{slug || 'slug'}</p>
          </div>
          <div>
            <Label htmlFor="html">Kode HTML</Label>
            <textarea
              id="html"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              required
              rows={12}
              className="w-full rounded border border-gray-600 bg-transparent p-2 font-mono text-xs"
              placeholder="Tempel HTML lengkap di sini..."
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Publish (tampil di /lp/{slug || 'slug'})
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handlePreview}
              disabled={!html.trim() || isPending}
            >
              Preview
            </Button>
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
