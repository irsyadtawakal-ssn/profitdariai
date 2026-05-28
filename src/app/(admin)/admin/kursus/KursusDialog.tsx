'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { createKursus, updateKursus } from './actions'

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  thumbnail_url: string | null
  is_published: boolean
}

interface KursusDialogProps {
  open: boolean
  onClose: () => void
  course?: Course
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export function KursusDialog({ open, onClose, course }: KursusDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(course?.title ?? '')
  const [slug, setSlug] = useState(course?.slug ?? '')
  const [isPublished, setIsPublished] = useState(course?.is_published ?? false)
  const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnail_url ?? '')
  const [uploading, setUploading] = useState(false)
  const isEdit = !!course

  useEffect(() => {
    setTitle(course?.title ?? '')
    setSlug(course?.slug ?? '')
    setIsPublished(course?.is_published ?? false)
    setThumbnailUrl(course?.thumbnail_url ?? '')
  }, [open, course])

  async function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `courses/${Date.now()}-${slugify(file.name.replace(`.${ext}`, ''))}.${ext}`
      const { error } = await supabase.storage.from('image').upload(path, file, { upsert: false })
      if (error) throw error
      const { data } = supabase.storage.from('image').getPublicUrl(path)
      setThumbnailUrl(data.publicUrl)
    } catch (err) {
      console.error('[KursusDialog upload]', err)
    } finally {
      setUploading(false)
    }
  }

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!isEdit) setSlug(slugify(val))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      if (isEdit) {
        await updateKursus(course.id, formData)
      } else {
        await createKursus(formData)
      }
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#F5F5F0]">
            {isEdit ? 'Edit Kursus' : 'Tambah Kursus'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kursus_title">Judul</Label>
            <Input
              id="kursus_title"
              name="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kursus_slug">Slug</Label>
            <Input
              id="kursus_slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kursus_category">Kategori</Label>
            <select
              id="kursus_category"
              name="category"
              defaultValue={course?.category ?? ''}
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
            <Label htmlFor="kursus_description">Deskripsi</Label>
            <textarea
              id="kursus_description"
              name="description"
              defaultValue={course?.description ?? ''}
              rows={3}
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-[#F5F5F0] placeholder:text-[#555555] focus:outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Thumbnail</Label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="text-sm text-[#888888] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#222222] file:text-[#F5F5F0] file:text-xs file:cursor-pointer hover:file:bg-[#2A2A2A]"
            />
            {uploading && <p className="text-xs text-[#D4AF37]">Mengupload...</p>}
            {thumbnailUrl && !uploading && (
              <p className="text-xs text-green-400 truncate">&#10003; Thumbnail siap</p>
            )}
            <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_published"
              value="true"
              id="kursus_published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="accent-[#D4AF37] w-4 h-4"
            />
            <Label htmlFor="kursus_published">Published</Label>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isPending}>
              {isEdit ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
