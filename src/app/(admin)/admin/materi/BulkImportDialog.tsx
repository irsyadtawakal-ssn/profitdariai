'use client'

import { ImportRow } from './actions'

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

// Placeholder — full UI in Task 3
export function BulkImportDialog(_props: { open: boolean; onClose: () => void }) {
  return null
}
