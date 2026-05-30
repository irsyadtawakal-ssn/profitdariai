'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { MateriDialog } from './MateriDialog'
import { deleteEbook } from './actions'

interface VideoItem {
  title: string
  url: string
}

interface Materi {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  cover_url: string | null
  file_path: string
  page_count: number | null
  is_published: boolean
  is_featured: boolean | null
  videos: VideoItem[] | null
}

export function MateriClient({ ebooks: materis }: { ebooks: Materi[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Materi | undefined>()
  const [, startTransition] = useTransition()

  function openAdd() { setEditTarget(undefined); setDialogOpen(true) }
  function openEdit(m: Materi) { setEditTarget(m); setDialogOpen(true) }
  function handleDelete(id: string) {
    if (!confirm('Hapus materi ini?')) return
    startTransition(() => deleteEbook(id))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#F5F5F0]">Materi</h1>
        <Button variant="primary" size="sm" onClick={openAdd}>+ Tambah</Button>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222222]">
              {['Judul', 'Kategori', 'Hal.', 'Video', 'Status', 'Aksi'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#555555] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {materis.map((m) => (
              <tr key={m.id} className="border-b border-[#222222] last:border-0 hover:bg-[#1A1A1A]/50 transition-colors">
                <td className="px-4 py-3 text-[#F5F5F0] font-medium">
                  <div className="flex items-center gap-2">
                    {m.is_featured && <span className="text-[#D4AF37] text-[10px] font-bold">★</span>}
                    {m.title}
                  </div>
                </td>
                <td className="px-4 py-3 text-[#888888]">{m.category}</td>
                <td className="px-4 py-3 text-[#888888]">{m.page_count ?? '—'}</td>
                <td className="px-4 py-3 text-[#888888]">
                  {m.videos && m.videos.length > 0
                    ? <span className="text-[#D4AF37] text-xs">{m.videos.length} video</span>
                    : <span className="text-[#333]">—</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    m.is_published ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'bg-[#1A1A1A] text-[#555555]'
                  }`}>
                    {m.is_published ? 'Aktif' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(m)} className="text-xs text-[#888888] hover:text-[#D4AF37] transition-colors">Edit</button>
                    <button onClick={() => handleDelete(m.id)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {materis.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#555555]">Belum ada materi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <MateriDialog open={dialogOpen} onClose={() => setDialogOpen(false)} materi={editTarget} />
    </>
  )
}
