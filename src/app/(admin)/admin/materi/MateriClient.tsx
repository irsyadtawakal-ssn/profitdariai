'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { MateriDialog } from './MateriDialog'
import { BulkImportDialog } from './BulkImportDialog'
import { deleteEbook, toggleEbookPublished } from './actions'

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
  documents: { title: string; url: string }[] | null
}

export function MateriClient({ ebooks: materis }: { ebooks: Materi[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Materi | undefined>()
  const [importOpen, setImportOpen] = useState(false)
  const [, startTransition] = useTransition()

  function openAdd() { setEditTarget(undefined); setDialogOpen(true) }
  function openEdit(m: Materi) { setEditTarget(m); setDialogOpen(true) }
  function handleDelete(id: string) {
    if (!confirm('Hapus materi ini?')) return
    startTransition(() => deleteEbook(id))
  }
  function handleToggle(id: string, current: boolean) {
    startTransition(() => toggleEbookPublished(id, current))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#F5F5F0]">Materi</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>Import CSV</Button>
          <Button variant="primary" size="sm" onClick={openAdd}>+ Tambah</Button>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-[#222222]">
              {['Judul', 'Kategori', 'Hal.', 'Video', 'Status', 'Aksi'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#555555] font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {materis.map((m) => (
              <tr key={m.id} className="border-b border-[#222222] last:border-0 hover:bg-[#1A1A1A]/50 transition-colors">
                <td className="px-4 py-3 text-[#F5F5F0] font-medium max-w-[200px]">
                  <div className="flex items-center gap-2">
                    {m.is_featured && <span className="text-[#D4AF37] text-[10px] font-bold shrink-0">★</span>}
                    <span className="truncate">{m.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#888888] whitespace-nowrap">{m.category}</td>
                <td className="px-4 py-3 text-[#888888] whitespace-nowrap">{m.page_count ?? '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {m.videos && m.videos.length > 0
                    ? <span className="text-[#D4AF37] text-xs">{m.videos.length} video</span>
                    : <span className="text-[#333]">—</span>
                  }
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => handleToggle(m.id, m.is_published)}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      m.is_published
                        ? 'bg-[#D4AF37]/15 text-[#D4AF37] hover:bg-red-900/20 hover:text-red-400'
                        : 'bg-[#1A1A1A] text-[#555555] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]'
                    }`}
                    title={m.is_published ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                  >
                    {m.is_published ? 'Aktif' : 'Draft'}
                  </button>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
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
      <BulkImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  )
}
