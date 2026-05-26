'use client'

import { useState, useTransition } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  const isEdit = !!course

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
            <Input id="kursus_category" name="category" defaultValue={course?.category ?? ''} required />
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
            <Label htmlFor="kursus_thumbnail">Thumbnail URL</Label>
            <Input id="kursus_thumbnail" name="thumbnail_url" defaultValue={course?.thumbnail_url ?? ''} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_published"
              value="true"
              id="kursus_published"
              defaultChecked={course?.is_published ?? false}
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
