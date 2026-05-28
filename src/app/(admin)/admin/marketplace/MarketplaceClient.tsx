'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { MarketplaceDialog } from './MarketplaceDialog'
import { deleteProduct, togglePublished } from './actions'

interface Product {
  id: string
  slug: string
  title: string
  description: string | null
  category: string
  price: number
  original_price: number | null
  cover_url: string | null
  product_url: string
  is_published: boolean
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export function MarketplaceClient({ products }: { products: Product[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Product | undefined>()
  const [, startTransition] = useTransition()

  function openAdd() { setEditTarget(undefined); setDialogOpen(true) }
  function openEdit(p: Product) { setEditTarget(p); setDialogOpen(true) }

  function handleDelete(id: string) {
    if (!confirm('Hapus produk ini?')) return
    startTransition(() => deleteProduct(id))
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(() => togglePublished(id, current))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#F5F5F0]">Marketplace</h1>
        <Button variant="primary" size="sm" onClick={openAdd}>+ Tambah</Button>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222222]">
              {['Produk', 'Kategori', 'Harga', 'Status', 'Aksi'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#555555] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-[#222222] last:border-0 hover:bg-[#1A1A1A]/50 transition-colors">
                <td className="px-4 py-3 text-[#F5F5F0] font-medium">{p.title}</td>
                <td className="px-4 py-3 text-[#888888]">{p.category}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-[#F5F5F0]">{formatPrice(p.price)}</span>
                    {p.original_price && (
                      <span className="text-[#555555] text-xs line-through">{formatPrice(p.original_price)}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggle(p.id, p.is_published)}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      p.is_published
                        ? 'bg-[#D4AF37]/15 text-[#D4AF37] hover:bg-red-900/20 hover:text-red-400'
                        : 'bg-[#1A1A1A] text-[#555555] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]'
                    }`}
                    title={p.is_published ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                  >
                    {p.is_published ? 'Aktif' : 'Draft'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-xs text-[#888888] hover:text-[#D4AF37] transition-colors">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#555555]">Belum ada produk.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <MarketplaceDialog open={dialogOpen} onClose={() => setDialogOpen(false)} product={editTarget} />
    </>
  )
}
