'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProduct, updateProduct } from './actions'

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
  ebook_id: string | null
}

interface EbookOption {
  id: string
  title: string
}

interface MarketplaceDialogProps {
  open: boolean
  onClose: () => void
  product?: Product
  ebooks: EbookOption[]
}

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function MarketplaceDialog({ open, onClose, product, ebooks }: MarketplaceDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(product?.title ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [isPublished, setIsPublished] = useState(product?.is_published ?? false)
  const [ebookId, setEbookId] = useState(product?.ebook_id ?? '')
  const isEdit = !!product

  useEffect(() => {
    setTitle(product?.title ?? '')
    setSlug(product?.slug ?? '')
    setIsPublished(product?.is_published ?? false)
    setEbookId(product?.ebook_id ?? '')
  }, [open, product])

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!isEdit) setSlug(slugify(val))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('is_published', isPublished ? 'true' : 'false')
    formData.set('ebook_id', ebookId || '')
    startTransition(async () => {
      if (isEdit) {
        await updateProduct(product.id, formData)
      } else {
        await createProduct(formData)
      }
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#F5F5F0]">
            {isEdit ? 'Edit Produk' : 'Tambah Produk'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mp_title">Nama Produk</Label>
            <Input
              id="mp_title"
              name="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mp_slug">Slug</Label>
            <Input
              id="mp_slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mp_category">Kategori</Label>
            <select
              id="mp_category"
              name="category"
              defaultValue={product?.category ?? ''}
              required
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="" disabled>Pilih kategori</option>
              <option value="Template">Template</option>
              <option value="Tools">Tools</option>
              <option value="Preset">Preset</option>
              <option value="Prompt">Prompt</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mp_description">Deskripsi</Label>
            <textarea
              id="mp_description"
              name="description"
              defaultValue={product?.description ?? ''}
              rows={2}
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-[#F5F5F0] placeholder:text-[#555555] focus:outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label htmlFor="mp_price">Harga (IDR)</Label>
              <Input
                id="mp_price"
                name="price"
                type="number"
                min={0}
                defaultValue={product?.price ?? 0}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <Label htmlFor="mp_original_price">Harga Coret (opsional)</Label>
              <Input
                id="mp_original_price"
                name="original_price"
                type="number"
                min={0}
                defaultValue={product?.original_price ?? ''}
                placeholder="Kosongkan jika tidak ada"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mp_ebook_id">
              Materi yang Di-unlock <span className="text-red-400 text-xs ml-1">* wajib agar akses terbuka</span>
            </Label>
            <select
              id="mp_ebook_id"
              value={ebookId}
              onChange={(e) => setEbookId(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="">— Pilih materi —</option>
              {ebooks.map((e) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
            {!ebookId && (
              <p className="text-xs text-red-400/80">Belum dipilih — user yang beli tidak akan dapat akses materi.</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mp_cover_url">Cover URL (opsional)</Label>
            <Input
              id="mp_cover_url"
              name="cover_url"
              type="url"
              defaultValue={product?.cover_url ?? ''}
              placeholder="https://..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mp_product_url">Link Produk</Label>
            <Input
              id="mp_product_url"
              name="product_url"
              type="url"
              defaultValue={product?.product_url ?? ''}
              placeholder="https://drive.google.com/..."
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="mp_published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="accent-[#D4AF37] w-4 h-4"
            />
            <Label htmlFor="mp_published">Published</Label>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>Batal</Button>
            <Button type="submit" variant="primary" size="sm" loading={isPending}>
              {isEdit ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
