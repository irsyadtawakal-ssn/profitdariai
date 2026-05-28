'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { EbookDialog } from './EbookDialog'
import { deleteEbook } from './actions'

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

export function EbookClient({ ebooks }: { ebooks: Ebook[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Ebook | undefined>()
  const [, startTransition] = useTransition()

  function openAdd() { setEditTarget(undefined); setDialogOpen(true) }
  function openEdit(e: Ebook) { setEditTarget(e); setDialogOpen(true) }
  function handleDelete(id: string) {
    if (!confirm('Hapus ebook ini?')) return
    startTransition(() => deleteEbook(id))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#F5F5F0]">Ebook</h1>
        <Button variant="primary" size="sm" onClick={openAdd}>+ Tambah</Button>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222222]">
              {['Judul', 'Kategori', 'Hal.', 'Status', 'Aksi'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#555555] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ebooks.map((e) => (
              <tr key={e.id} className="border-b border-[#222222] last:border-0 hover:bg-[#1A1A1A]/50 transition-colors">
                <td className="px-4 py-3 text-[#F5F5F0] font-medium">{e.title}</td>
                <td className="px-4 py-3 text-[#888888]">{e.category}</td>
                <td className="px-4 py-3 text-[#888888]">{e.page_count ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    e.is_published ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'bg-[#1A1A1A] text-[#555555]'
                  }`}>
                    {e.is_published ? 'Aktif' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(e)} className="text-xs text-[#888888] hover:text-[#D4AF37] transition-colors">Edit</button>
                    <button onClick={() => handleDelete(e.id)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {ebooks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#555555]">Belum ada ebook.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EbookDialog open={dialogOpen} onClose={() => setDialogOpen(false)} ebook={editTarget} />
    </>
  )
}
