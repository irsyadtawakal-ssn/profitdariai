'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { LandingDialog, type LandingPage } from './LandingDialog'
import { deleteLandingPage, togglePublish } from './actions'

export function LandingClient({ pages }: { pages: LandingPage[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<LandingPage | undefined>()
  const [, startTransition] = useTransition()

  function openAdd() { setEditTarget(undefined); setDialogOpen(true) }
  function openEdit(p: LandingPage) { setEditTarget(p); setDialogOpen(true) }

  function handleDelete(id: string) {
    if (!confirm('Hapus landing page ini?')) return
    startTransition(() => deleteLandingPage(id))
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(() => togglePublish(id, current))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#F5F5F0]">Landing Pages</h1>
        <Button variant="primary" size="sm" onClick={openAdd}>+ Tambah</Button>
      </div>

      <div className="space-y-2">
        {pages.length === 0 && <p className="text-gray-400">Belum ada landing page.</p>}
        {pages.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded border border-gray-700 p-3">
            <div>
              <p className="font-semibold text-[#F5F5F0]">{p.title}</p>
              <a href={`/lp/${p.slug}`} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:underline">
                /lp/{p.slug} {p.published ? '· Live' : '· Draft'}
              </a>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleToggle(p.id, p.published)}>
                {p.published ? 'Unpublish' : 'Publish'}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => openEdit(p)}>Edit</Button>
              <Button variant="secondary" size="sm" onClick={() => handleDelete(p.id)}>Hapus</Button>
            </div>
          </div>
        ))}
      </div>

      <LandingDialog open={dialogOpen} onClose={() => setDialogOpen(false)} landing={editTarget} />
    </>
  )
}
