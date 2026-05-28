'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createEbook, updateEbook } from './actions'
import { toast } from 'sonner'

const MAX_COVER_SIZE_MB = 5

/** Konversi berbagai format URL GDrive → direct download URL */
function parseGdriveUrl(input: string): string | null {
  input = input.trim()
  // Format: https://drive.google.com/file/d/FILE_ID/view?...
  const fileMatch = input.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`
  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = input.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/)
  if (openMatch) return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`
  // Sudah dalam format uc?export=download
  if (input.includes('drive.google.com/uc') && input.includes('export=download')) return input
  return null
}

interface Ebook {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  cover_url: string | null
  file_path: string
  page_count: number | null
  is_published: boolean
}

interface EbookDialogProps {
  open: boolean
  onClose: () => void
  ebook?: Ebook
}

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function EbookDialog({ open, onClose, ebook }: EbookDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(ebook?.title ?? '')
  const [slug, setSlug] = useState(ebook?.slug ?? '')
  const [filePath, setFilePath] = useState(ebook?.file_path ?? '')
  const [gdriveInput, setGdriveInput] = useState('')
  const [gdriveValid, setGdriveValid] = useState<boolean | null>(null)
  const [coverUrl, setCoverUrl] = useState(ebook?.cover_url ?? '')
  const [uploadingCover, setUploadingCover] = useState(false)
  const isEdit = !!ebook

  useEffect(() => {
    setTitle(ebook?.title ?? '')
    setSlug(ebook?.slug ?? '')
    setFilePath(ebook?.file_path ?? '')
    setCoverUrl(ebook?.cover_url ?? '')
    setIsPublished(ebook?.is_published ?? false)
    // Pre-fill GDrive input jika sudah ada file_path berbentuk URL
    const existing = ebook?.file_path ?? ''
    setGdriveInput(existing.startsWith('https://') ? existing : '')
    setGdriveValid(null)
  }, [open, ebook])

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > MAX_COVER_SIZE_MB) {
      toast.error(`Cover terlalu besar (${sizeMB.toFixed(1)} MB). Maksimal ${MAX_COVER_SIZE_MB} MB.`)
      e.target.value = ''
      return
    }

    setUploadingCover(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `ebooks/${Date.now()}-${slugify(file.name.replace(`.${ext}`, ''))}.${ext}`
      const { error } = await supabase.storage.from('image').upload(path, file, { upsert: false })
      if (error) throw error
      const { data } = supabase.storage.from('image').getPublicUrl(path)
      setCoverUrl(data.publicUrl)
      toast.success('Cover berhasil diupload!')
    } catch (err) {
      console.error('[EbookDialog cover upload]', err)
      toast.error('Gagal mengupload cover. Coba lagi.')
    } finally {
      setUploadingCover(false)
    }
  }

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!isEdit) setSlug(slugify(val))
  }

  function handleGdriveChange(val: string) {
    setGdriveInput(val)
    if (!val.trim()) {
      setGdriveValid(null)
      setFilePath(isEdit ? ebook?.file_path ?? '' : '')
      return
    }
    const converted = parseGdriveUrl(val)
    if (converted) {
      setFilePath(converted)
      setGdriveValid(true)
    } else {
      setFilePath('')
      setGdriveValid(false)
    }
  }

  const [isPublished, setIsPublished] = useState(ebook?.is_published ?? false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('file_path', filePath)
    startTransition(async () => {
      if (isEdit) {
        await updateEbook(ebook.id, formData)
      } else {
        await createEbook(formData)
      }
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#F5F5F0]">
            {isEdit ? 'Edit Ebook' : 'Tambah Ebook'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ebook_title">Judul</Label>
            <Input id="ebook_title" name="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ebook_slug">Slug</Label>
            <Input id="ebook_slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ebook_category">Kategori</Label>
            <select
              id="ebook_category"
              name="category"
              defaultValue={ebook?.category ?? ''}
              required
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="" disabled>Pilih kategori</option>
              <option value="Bisnis">Bisnis</option>
              <option value="Freelancing">Freelancing</option>
              <option value="Konten">Konten</option>
              <option value="Otomasi">Otomasi</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ebook_description">Deskripsi</Label>
            <textarea
              id="ebook_description"
              name="description"
              defaultValue={ebook?.description ?? ''}
              rows={2}
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-[#F5F5F0] placeholder:text-[#555555] focus:outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label>Cover</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="text-sm text-[#888888] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#222222] file:text-[#F5F5F0] file:text-xs file:cursor-pointer hover:file:bg-[#2A2A2A]"
              />
              {uploadingCover && <p className="text-xs text-[#D4AF37]">Mengupload...</p>}
              {coverUrl && !uploadingCover && <p className="text-xs text-green-400">&#10003; Cover siap</p>}
              <input type="hidden" name="cover_url" value={coverUrl} />
            </div>
            <div className="flex flex-col gap-1.5 w-28">
              <Label htmlFor="ebook_page_count">Jumlah Hal.</Label>
              <Input id="ebook_page_count" name="page_count" type="number" defaultValue={ebook?.page_count ?? ''} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ebook_gdrive">Link Google Drive PDF</Label>
            <Input
              id="ebook_gdrive"
              type="url"
              placeholder="https://drive.google.com/file/d/FILE_ID/view"
              value={gdriveInput}
              onChange={(e) => handleGdriveChange(e.target.value)}
              error={gdriveValid === false}
            />
            {gdriveValid === true && (
              <p className="text-xs text-green-400">&#10003; Link valid — akan otomatis jadi direct download.</p>
            )}
            {gdriveValid === false && (
              <p className="text-xs text-red-400">Link bukan dari Google Drive atau format tidak dikenali.</p>
            )}
            {!gdriveInput && isEdit && (
              <p className="text-xs text-[#555555]">Kosongkan jika tidak ingin ganti link.</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_published"
              value="true"
              id="ebook_published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="accent-[#D4AF37] w-4 h-4"
            />
            <Label htmlFor="ebook_published">Published</Label>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>Batal</Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isPending}
              disabled={!filePath && !isEdit}
            >
              {isEdit ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
