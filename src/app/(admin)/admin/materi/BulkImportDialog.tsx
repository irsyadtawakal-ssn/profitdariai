'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { bulkImportMateri, ImportRow, ImportResult } from './actions'

const VALID_CATEGORIES = ['Bisnis', 'Freelancing', 'Konten', 'Otomasi', 'Prompt', 'Lainnya'] as const

const CSV_TEMPLATE = `title,slug,category,description,file_path,cover_url,page_count,is_featured,is_published
Panduan Prompt AI,panduan-prompt-ai,Prompt,Deskripsi singkat materi,https://drive.google.com/file/d/FILE_ID/view,,50,false,false
Bisnis Digital dengan AI,,Bisnis,,https://drive.google.com/file/d/FILE_ID2/view,https://example.com/cover.jpg,80,false,true`

function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function parseGdriveUrl(input: string): string | null {
  const trimmed = input.trim()
  const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`
  const openMatch = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/)
  if (openMatch) return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`
  if (trimmed.includes('drive.google.com/uc') && trimmed.includes('export=download')) return trimmed
  return null
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function validateRow(
  cells: string[],
  headers: string[],
  rowIndex: number
): { valid: true; data: ImportRow } | { valid: false; error: string } {
  const get = (col: string) => cells[headers.indexOf(col)]?.trim() ?? ''

  const title = get('title')
  if (!title) return { valid: false, error: `Baris ${rowIndex}: Judul wajib diisi` }

  const category = get('category')
  if (!VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    return { valid: false, error: `Baris ${rowIndex}: Kategori "${category}" tidak dikenali` }
  }

  const rawFilePath = get('file_path')
  const filePath = parseGdriveUrl(rawFilePath)
  if (!filePath) return { valid: false, error: `Baris ${rowIndex}: Link GDrive tidak valid` }

  const rawSlug = get('slug')
  const slug = rawSlug || slugify(title)

  const pageCountRaw = get('page_count')
  const pageCount = pageCountRaw ? Number(pageCountRaw) : null
  if (pageCountRaw && isNaN(Number(pageCountRaw))) {
    return { valid: false, error: `Baris ${rowIndex}: Jumlah halaman harus angka` }
  }

  return {
    valid: true,
    data: {
      title,
      slug,
      category,
      description: get('description') || null,
      file_path: filePath,
      cover_url: get('cover_url') || null,
      page_count: pageCount,
      is_featured: get('is_featured') === 'true',
      is_published: get('is_published') === 'true',
    },
  }
}

export function parseCsv(text: string): {
  rows: ({ valid: true; data: ImportRow } | { valid: false; error: string })[]
  globalError: string | null
} {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  if (lines.length < 2) return { rows: [], globalError: 'File CSV kosong atau hanya berisi header' }

  const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim())
  const dataLines = lines.slice(1)

  if (dataLines.length > 100) {
    return { rows: [], globalError: 'Maksimal 100 baris per import' }
  }

  const rows = dataLines.map((line, i) => {
    const cells = parseCsvLine(line)
    if (cells.every(c => !c)) return null
    return validateRow(cells, headers, i + 2)
  }).filter(Boolean) as ({ valid: true; data: ImportRow } | { valid: false; error: string })[]

  return { rows, globalError: null }
}

type ParsedRow = { valid: true; data: ImportRow } | { valid: false; error: string }
type Status = 'idle' | 'preview' | 'importing' | 'done'

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'template-bulk-import-materi.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function BulkImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<Status>('idle')
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [, startTransition] = useTransition()

  function handleClose() {
    setStatus('idle')
    setRows([])
    setGlobalError(null)
    setResult(null)
    onClose()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const parsed = parseCsv(text)
      setGlobalError(parsed.globalError)
      setRows(parsed.rows)
      setStatus('preview')
    }
    reader.readAsText(file)
  }

  function handleImport() {
    const validRows = rows.filter(r => r.valid).map(r => (r as { valid: true; data: ImportRow }).data)
    if (validRows.length === 0) return
    setStatus('importing')
    startTransition(async () => {
      const res = await bulkImportMateri(validRows)
      setResult(res)
      setStatus('done')
    })
  }

  const validCount = rows.filter(r => r.valid).length
  const errorCount = rows.filter(r => !r.valid).length

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#F5F5F0]">Import CSV Materi</DialogTitle>
        </DialogHeader>

        {/* IDLE */}
        {status === 'idle' && (
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-sm text-[#888888]">
              Upload file CSV untuk menambahkan banyak materi sekaligus. Maks. 100 baris per import.
            </p>
            <button
              type="button"
              onClick={downloadTemplate}
              className="text-sm text-[#D4AF37] hover:underline text-left"
            >
              ↓ Download Template CSV
            </button>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#F5F5F0]">Upload File CSV</label>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="text-sm text-[#888888] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#222222] file:text-[#F5F5F0] file:text-xs file:cursor-pointer hover:file:bg-[#2A2A2A]"
              />
            </div>
          </div>
        )}

        {/* PREVIEW */}
        {status === 'preview' && (
          <div className="flex flex-col gap-4 mt-2">
            {globalError && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">
                {globalError}
              </p>
            )}
            {!globalError && (
              <>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-400">✓ {validCount} baris valid</span>
                  {errorCount > 0 && <span className="text-red-400">✗ {errorCount} baris error</span>}
                </div>
                <div className="overflow-x-auto border border-[#222] rounded-lg max-h-64 overflow-y-auto">
                  <table className="w-full text-xs min-w-[500px]">
                    <thead className="sticky top-0 bg-[#111]">
                      <tr className="border-b border-[#222]">
                        {['#', 'Status', 'Judul', 'Kategori', 'Slug'].map(h => (
                          <th key={h} className="text-left px-3 py-2 text-[#555] font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i} className={`border-b border-[#1a1a1a] last:border-0 ${row.valid ? '' : 'bg-red-950/20'}`}>
                          <td className="px-3 py-2 text-[#555]">{i + 2}</td>
                          <td className="px-3 py-2">
                            {row.valid
                              ? <span className="text-green-400 text-[10px] font-bold">✓ Valid</span>
                              : <span className="text-red-400 text-[10px] font-bold">✗ Error</span>
                            }
                          </td>
                          <td className="px-3 py-2 text-[#F5F5F0] max-w-[160px] truncate">
                            {row.valid ? row.data.title : <span className="text-red-400 text-[10px]">{row.error}</span>}
                          </td>
                          <td className="px-3 py-2 text-[#888]">{row.valid ? row.data.category : '—'}</td>
                          <td className="px-3 py-2 text-[#888] max-w-[120px] truncate">{row.valid ? row.data.slug : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-2 justify-between items-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setStatus('idle'); setRows([]); setGlobalError(null) }}
                    className="text-xs text-[#888] hover:text-[#F5F5F0]"
                  >
                    ← Ganti file
                  </button>
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={handleClose}>Batal</Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleImport}
                      disabled={validCount === 0}
                    >
                      Import {validCount} Materi
                    </Button>
                  </div>
                </div>
              </>
            )}
            {globalError && (
              <div className="flex justify-end">
                <Button type="button" variant="secondary" size="sm" onClick={() => { setStatus('idle'); setGlobalError(null) }}>
                  Coba Lagi
                </Button>
              </div>
            )}
          </div>
        )}

        {/* IMPORTING */}
        {status === 'importing' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#888]">Mengimport {validCount} materi...</p>
          </div>
        )}

        {/* DONE */}
        {status === 'done' && result && (
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-2">
              {result.success > 0 && (
                <p className="text-sm text-green-400">✓ {result.success} materi berhasil diimport</p>
              )}
              {result.errors.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-red-400">✗ {result.errors.length} gagal:</p>
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-xs text-[#888] pl-3">Baris {e.row}: {e.message}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="primary" size="sm" onClick={handleClose}>Tutup</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
