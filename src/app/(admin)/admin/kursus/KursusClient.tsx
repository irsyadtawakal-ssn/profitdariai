'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { KursusDialog } from './KursusDialog'
import { deleteKursus } from './actions'

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  thumbnail_url: string | null
  is_published: boolean
  moduleCount: number
}

export function KursusClient({ courses }: { courses: Course[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Course | undefined>()
  const [, startTransition] = useTransition()

  function openAdd() {
    setEditTarget(undefined)
    setDialogOpen(true)
  }

  function openEdit(course: Course) {
    setEditTarget(course)
    setDialogOpen(true)
  }

  function handleDelete(id: string) {
    if (!confirm('Hapus kursus ini? Semua modul akan ikut terhapus.')) return
    startTransition(() => deleteKursus(id))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#F5F5F0]">Kursus</h1>
        <Button variant="primary" size="sm" onClick={openAdd}>+ Tambah</Button>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222222]">
              {['Judul', 'Kategori', 'Modul', 'Status', 'Aksi'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#555555] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-b border-[#222222] last:border-0 hover:bg-[#1A1A1A]/50 transition-colors">
                <td className="px-4 py-3 text-[#F5F5F0] font-medium">{c.title}</td>
                <td className="px-4 py-3 text-[#888888]">{c.category}</td>
                <td className="px-4 py-3 text-[#888888]">{c.moduleCount}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    c.is_published ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'bg-[#1A1A1A] text-[#555555]'
                  }`}>
                    {c.is_published ? 'Aktif' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(c)}
                      className="text-xs text-[#888888] hover:text-[#D4AF37] transition-colors"
                    >
                      Edit
                    </button>
                    <Link
                      href={`/admin/kursus/${c.id}/modul`}
                      className="text-xs text-[#888888] hover:text-[#D4AF37] transition-colors"
                    >
                      Modul
                    </Link>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-xs text-red-500 hover:text-red-400 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#555555]">
                  Belum ada kursus.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <KursusDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        course={editTarget}
      />
    </>
  )
}
