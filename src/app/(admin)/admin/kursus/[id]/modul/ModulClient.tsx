'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { ModulDialog } from './ModulDialog'
import { deleteModul } from './actions'

interface Modul {
  id: string
  title: string
  video_url: string
  duration_seconds: number | null
  sort_order: number
}

function formatDuration(sec: number | null) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function ModulClient({ courseId, courseTitle, modules }: {
  courseId: string
  courseTitle: string
  modules: Modul[]
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Modul | undefined>()
  const [, startTransition] = useTransition()

  function openAdd() { setEditTarget(undefined); setDialogOpen(true) }
  function openEdit(m: Modul) { setEditTarget(m); setDialogOpen(true) }
  function handleDelete(modulId: string) {
    if (!confirm('Hapus modul ini?')) return
    startTransition(() => deleteModul(courseId, modulId))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[#888888] text-sm mb-1">
            ← <a href="/admin/kursus" className="hover:text-[#D4AF37] transition-colors">Kursus</a>
          </p>
          <h1 className="text-2xl font-bold text-[#F5F5F0]">{courseTitle} — Modul</h1>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>+ Tambah Modul</Button>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1A1A1A]">
              {['#', 'Judul', 'Video URL', 'Durasi', 'Aksi'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#555555] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((m, i) => (
              <tr key={m.id} className="border-b border-[#1A1A1A] last:border-0 hover:bg-[#1A1A1A]/50 transition-colors">
                <td className="px-4 py-3 text-[#555555] font-mono text-xs">{i + 1}</td>
                <td className="px-4 py-3 text-[#F5F5F0]">{m.title}</td>
                <td className="px-4 py-3 text-[#888888] max-w-xs truncate">{m.video_url}</td>
                <td className="px-4 py-3 text-[#888888]">{formatDuration(m.duration_seconds)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(m)} className="text-xs text-[#888888] hover:text-[#D4AF37] transition-colors">Edit</button>
                    <button onClick={() => handleDelete(m.id)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {modules.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#555555]">Belum ada modul.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ModulDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        courseId={courseId}
        modul={editTarget}
      />
    </>
  )
}
