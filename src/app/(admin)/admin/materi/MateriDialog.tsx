'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { createEbook, updateEbook } from './actions'
import { toast } from 'sonner'

const MAX_COVER_SIZE_MB = 5

function parseGdriveUrl(input: string): string | null {
  input = input.trim()
  const fileMatch = input.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`
  const openMatch = input.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/)
  if (openMatch) return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`
  if (input.includes('drive.google.com/uc') && input.includes('export=download')) return input
  return null
}

interface VideoItem {
  title: string
  url: string
}

interface DocumentItem {
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
  is_bump_product: boolean | null
  bump_price: number | null
  videos: VideoItem[] | null
  documents: DocumentItem[] | null
  drive_folder_url: string | null
}

interface MateriDialogProps {
  open: boolean
  onClose: () => void
  materi?: Materi
}

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function MateriDialog({ open, onClose, materi }: MateriDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(materi?.title ?? '')
  const [slug, setSlug] = useState(materi?.slug ?? '')
  const [filePath, setFilePath] = useState(materi?.file_path ?? '')
  const [gdriveInput, setGdriveInput] = useState('')
  const [gdriveValid, setGdriveValid] = useState<boolean | null>(null)
  const [coverUrl, setCoverUrl] = useState(materi?.cover_url ?? '')
  const [uploadingCover, setUploadingCover] = useState(false)
  const [isPublished, setIsPublished] = useState(materi?.is_published ?? false)
  const [isFeatured, setIsFeatured] = useState(materi?.is_featured ?? false)
  const [isBumpProduct, setIsBumpProduct] = useState(materi?.is_bump_product ?? false)
  const [bumpPrice, setBumpPrice] = useState(materi?.bump_price?.toString() ?? '')
  const [videos, setVideos] = useState<VideoItem[]>(materi?.videos ?? [])
  const [documents, setDocuments] = useState<DocumentItem[]>(materi?.documents ?? [])
  const [driveFolderUrl, setDriveFolderUrl] = useState(materi?.drive_folder_url ?? '')
  const [sellInMarketplace, setSellInMarketplace] = useState(false)
  const [marketplacePrice, setMarketplacePrice] = useState('')
  const [marketplaceOriginalPrice, setMarketplaceOriginalPrice] = useState('')
  const isEdit = !!materi

  useEffect(() => {
    setTitle(materi?.title ?? '')
    setSlug(materi?.slug ?? '')
    setFilePath(materi?.file_path ?? '')
    setCoverUrl(materi?.cover_url ?? '')
    setIsPublished(materi?.is_published ?? false)
    setIsFeatured(materi?.is_featured ?? false)
    setIsBumpProduct(materi?.is_bump_product ?? false)
    setBumpPrice(materi?.bump_price?.toString() ?? '')
    setVideos(materi?.videos ?? [])
    setDocuments(materi?.documents ?? [])
    setDriveFolderUrl(materi?.drive_folder_url ?? '')
    const existing = materi?.file_path ?? ''
    setGdriveInput(existing.startsWith('https://') ? existing : '')
    setGdriveValid(null)
    setSellInMarketplace(false)
    setMarketplacePrice('')
    setMarketplaceOriginalPrice('')
  }, [open, materi])

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > MAX_COVER_SIZE_MB) {
      toast.error(`Cover terlalu besar (${sizeMB.toFixed(1)} MB). Maksimal ${MAX_COVER_SIZE_MB} MB.`)
      e.target.value = ''
      return
    }
    setUploadingCover(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `ebooks/${Date.now()}-${slugify(file.name.replace(`.${ext}`, ''))}.${ext}`
      const { error } = await supabase.storage.from('image').upload(path, file, { upsert: false })
      if (error) throw error
      const { data } = supabase.storage.from('image').getPublicUrl(path)
      setCoverUrl(data.publicUrl)
      toast.success('Cover berhasil diupload!')
    } catch (err) {
      console.error('[MateriDialog cover upload]', err)
      toast.error('Gagal mengupload cover. Coba lagi.')
    } finally {
      setUploadingCover(false)
    }
  }

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!isEdit) setSlug(slugify(val))
  }

  function handleGdriveChange(val: string) {
    setGdriveInput(val)
    if (!val.trim()) {
      setGdriveValid(null)
      setFilePath(isEdit ? materi?.file_path ?? '' : '')
      return
    }
    const converted = parseGdriveUrl(val)
    if (converted) { setFilePath(converted); setGdriveValid(true) }
    else { setFilePath(''); setGdriveValid(false) }
  }

  function addVideo() { setVideos([...videos, { title: '', url: '' }]) }
  function removeVideo(index: number) { setVideos(videos.filter((_, i) => i !== index)) }
  function updateVideo(index: number, field: 'title' | 'url', value: string) {
    setVideos(videos.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }

  function addDocument() { setDocuments([...documents, { title: '', url: '' }]) }
  function removeDocument(index: number) { setDocuments(documents.filter((_, i) => i !== index)) }
  function updateDocument(index: number, field: 'title' | 'url', value: string) {
    setDocuments(documents.map((d, i) => i === index ? { ...d, [field]: value } : d))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('file_path', filePath)
    formData.set('is_featured', isFeatured ? 'true' : 'false')
    formData.set('is_bump_product', isBumpProduct ? 'true' : 'false')
    formData.set('bump_price', bumpPrice)
    const validVideos = videos.filter(v => v.title.trim() && v.url.trim())
    formData.set('videos', validVideos.length > 0 ? JSON.stringify(validVideos) : '')
    const validDocs = documents.filter(d => d.title.trim() && d.url.trim())
    formData.set('documents', validDocs.length > 0 ? JSON.stringify(validDocs) : '')
    formData.set('sell_in_marketplace', sellInMarketplace ? 'true' : 'false')
    formData.set('marketplace_price', marketplacePrice)
    formData.set('marketplace_original_price', marketplaceOriginalPrice)
    startTransition(async () => {
      if (isEdit) {
        await updateEbook(materi.id, formData)
      } else {
        await createEbook(formData)
      }
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#F5F5F0]">
            {isEdit ? 'Edit Materi' : 'Tambah Materi'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m_title">Judul</Label>
            <Input id="m_title" name="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m_slug">Slug</Label>
            <Input id="m_slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m_category">Kategori</Label>
            <select
              id="m_category"
              name="category"
              defaultValue={materi?.category ?? ''}
              required
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="" disabled>Pilih kategori</option>
              <option value="Materi">Materi</option>
              <option value="Tools">Tools</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m_description">Deskripsi</Label>
            <textarea
              id="m_description"
              name="description"
              defaultValue={materi?.description ?? ''}
              rows={2}
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-[#F5F5F0] placeholder:text-[#555555] focus:outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label>Cover</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="text-sm text-[#888888] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#222222] file:text-[#F5F5F0] file:text-xs file:cursor-pointer hover:file:bg-[#2A2A2A]"
              />
              {uploadingCover && <p className="text-xs text-[#D4AF37]">Mengupload...</p>}
              {coverUrl && !uploadingCover && (
                <div className="flex items-center gap-2 mt-1">
                  <img src={coverUrl} alt="preview" className="w-12 h-16 object-cover rounded border border-[#333]" />
                  <p className="text-xs text-green-400">&#10003; Cover siap</p>
                </div>
              )}
              <input type="hidden" name="cover_url" value={coverUrl} />
            </div>
            <div className="flex flex-col gap-1.5 w-28">
              <Label htmlFor="m_page_count">Jumlah Hal.</Label>
              <Input id="m_page_count" name="page_count" type="number" defaultValue={materi?.page_count ?? ''} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m_gdrive">Link Google Drive PDF</Label>
            <Input
              id="m_gdrive"
              type="url"
              placeholder="https://drive.google.com/file/d/FILE_ID/view"
              value={gdriveInput}
              onChange={(e) => handleGdriveChange(e.target.value)}
              error={gdriveValid === false}
            />
            {gdriveValid === true && <p className="text-xs text-green-400">&#10003; Link valid — akan otomatis jadi direct download.</p>}
            {gdriveValid === false && <p className="text-xs text-red-400">Link bukan dari Google Drive atau format tidak dikenali.</p>}
            {!gdriveInput && isEdit && <p className="text-xs text-[#555555]">Kosongkan jika tidak ingin ganti link.</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m_drive_folder_url">Link Google Drive Folder (opsional)</Label>
            <Input
              id="m_drive_folder_url"
              name="drive_folder_url"
              type="url"
              value={driveFolderUrl}
              onChange={(e) => setDriveFolderUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
            />
            <p className="text-xs text-[#555555]">Link folder Drive — member bisa akses seluruh isi folder.</p>
          </div>

          {/* VIDEO SECTION */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Video YouTube (opsional)</Label>
              <button type="button" onClick={addVideo} className="text-xs text-[#D4AF37] hover:underline">
                + Tambah Video
              </button>
            </div>
            {videos.length === 0 && (
              <p className="text-xs text-[#444]">Belum ada video. Klik &quot;+ Tambah Video&quot; untuk menambahkan.</p>
            )}
            {videos.map((video, index) => (
              <div key={index} className="flex flex-col gap-2 bg-[#111] border border-[#222] rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#555] font-medium">Video {index + 1}</span>
                  <button type="button" onClick={() => removeVideo(index)} className="text-xs text-red-500 hover:text-red-400">Hapus</button>
                </div>
                <Input
                  placeholder="Judul video (misal: Pengenalan Prompt)"
                  value={video.title}
                  onChange={(e) => updateVideo(index, 'title', e.target.value)}
                />
                <Input
                  placeholder="YouTube URL atau video ID (misal: dQw4w9WgXcQ)"
                  value={video.url}
                  onChange={(e) => updateVideo(index, 'url', e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* DOKUMEN TAMBAHAN */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Dokumen Tambahan (opsional)</Label>
              <button type="button" onClick={addDocument} className="text-xs text-[#D4AF37] hover:underline">
                + Tambah Dokumen
              </button>
            </div>
            {documents.length === 0 && (
              <p className="text-xs text-[#444]">Belum ada dokumen. Klik &quot;+ Tambah Dokumen&quot; untuk menambahkan.</p>
            )}
            {documents.map((doc, index) => (
              <div key={index} className="flex flex-col gap-2 bg-[#111] border border-[#222] rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#555] font-medium">Dokumen {index + 1}</span>
                  <button type="button" onClick={() => removeDocument(index)} className="text-xs text-red-500 hover:text-red-400">Hapus</button>
                </div>
                <Input
                  placeholder="Judul dokumen (misal: Slide Presentasi)"
                  value={doc.title}
                  onChange={(e) => updateDocument(index, 'title', e.target.value)}
                />
                <Input
                  placeholder="Google Drive URL (https://drive.google.com/file/d/...)"
                  value={doc.url}
                  onChange={(e) => updateDocument(index, 'url', e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="m_featured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-[#D4AF37] w-4 h-4" />
              <Label htmlFor="m_featured">Jadikan Materi Pilihan (★ Featured di Dashboard)</Label>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input type="checkbox" id="m_bump" checked={isBumpProduct} onChange={(e) => setIsBumpProduct(e.target.checked)} className="accent-[#D4AF37] w-4 h-4" />
              <Label htmlFor="m_bump">Jadikan Produk Bump Checkout (Step 2)</Label>
            </div>
            {isBumpProduct && (
              <div className="mt-2">
                <Label htmlFor="m_bump_price">Harga Bump (IDR)</Label>
                <Input
                  id="m_bump_price"
                  type="number"
                  value={bumpPrice}
                  onChange={(e) => setBumpPrice(e.target.value)}
                  placeholder="Contoh: 47000"
                  className="bg-[#1a1a1a] border-[#333333] text-[#F5F5F0]"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input type="checkbox" name="is_published" value="true" id="m_published" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="accent-[#D4AF37] w-4 h-4" />
              <Label htmlFor="m_published">Published</Label>
            </div>
          </div>

          {/* JUAL DI MARKETPLACE — hanya saat create */}
          {!isEdit && (
            <div className="border border-[#222] rounded-lg p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#F5F5F0]">Jual di Marketplace?</p>
                  <p className="text-xs text-[#555] mt-0.5">Otomatis buat produk marketplace yang terhubung ke materi ini</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSellInMarketplace(!sellInMarketplace)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${sellInMarketplace ? 'bg-[#D4AF37]' : 'bg-[#333]'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${sellInMarketplace ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              {sellInMarketplace && (
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Label htmlFor="mp_price_inline">Harga (IDR)</Label>
                    <Input
                      id="mp_price_inline"
                      type="number"
                      min={0}
                      placeholder="49000"
                      value={marketplacePrice}
                      onChange={(e) => setMarketplacePrice(e.target.value)}
                      required={sellInMarketplace}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Label htmlFor="mp_original_inline">Harga Coret (opsional)</Label>
                    <Input
                      id="mp_original_inline"
                      type="number"
                      min={0}
                      placeholder="99000"
                      value={marketplaceOriginalPrice}
                      onChange={(e) => setMarketplaceOriginalPrice(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>Batal</Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isPending}
              disabled={(!filePath && !driveFolderUrl && !isEdit) || (sellInMarketplace && !marketplacePrice)}
            >
              {isEdit ? 'Simpan' : sellInMarketplace ? 'Tambah + Buat Produk' : 'Tambah'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
