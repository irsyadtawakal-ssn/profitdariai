'use client'

import { useTransition } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createModul, updateModul } from './actions'

interface Modul {
  id: string
  title: string
  video_url: string
  duration_seconds: number | null
  sort_order: number
}

interface ModulDialogProps {
  open: boolean
  onClose: () => void
  courseId: string
  modul?: Modul
}

export function ModulDialog({ open, onClose, courseId, modul }: ModulDialogProps) {
  const [isPending, startTransition] = useTransition()
  const isEdit = !!modul

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      if (isEdit) {
        await updateModul(courseId, modul.id, formData)
      } else {
        await createModul(courseId, formData)
      }
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#F5F5F0]">
            {isEdit ? 'Edit Modul' : 'Tambah Modul'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="modul_title">Judul Modul</Label>
            <Input id="modul_title" name="title" defaultValue={modul?.title ?? ''} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="modul_video_url">YouTube Video URL</Label>
            <Input
              id="modul_video_url"
              name="video_url"
              defaultValue={modul?.video_url ?? ''}
              placeholder="https://youtu.be/..."
              required
            />
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label htmlFor="modul_duration">Durasi (detik)</Label>
              <Input
                id="modul_duration"
                name="duration_seconds"
                type="number"
                defaultValue={modul?.duration_seconds ?? ''}
                placeholder="misal: 600"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-24">
              <Label htmlFor="modul_sort_order">Urutan</Label>
              <Input
                id="modul_sort_order"
                name="sort_order"
                type="number"
                defaultValue={modul?.sort_order ?? 0}
                required
              />
            </div>
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
