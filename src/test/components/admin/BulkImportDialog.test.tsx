import { describe, it, expect } from 'vitest'
import { parseCsv } from '@/app/(admin)/admin/materi/BulkImportDialog'

const VALID_CSV = `title,slug,category,description,file_path,cover_url,page_count,is_featured,is_published
Panduan Prompt AI,panduan-prompt-ai,Prompt,Deskripsi,https://drive.google.com/file/d/abc123/view,,50,false,false
Bisnis Digital,,Bisnis,,https://drive.google.com/file/d/def456/view,,, false,true`

describe('parseCsv', () => {
  it('returns rows for valid CSV', () => {
    const { rows, globalError } = parseCsv(VALID_CSV)
    expect(globalError).toBeNull()
    expect(rows).toHaveLength(2)
    expect(rows[0].valid).toBe(true)
    if (rows[0].valid) {
      expect(rows[0].data.title).toBe('Panduan Prompt AI')
      expect(rows[0].data.slug).toBe('panduan-prompt-ai')
      expect(rows[0].data.file_path).toBe('https://drive.google.com/uc?export=download&id=abc123')
      expect(rows[0].data.page_count).toBe(50)
      expect(rows[0].data.is_featured).toBe(false)
    }
  })

  it('auto-generates slug from title when slug is empty', () => {
    const { rows } = parseCsv(VALID_CSV)
    expect(rows[1].valid).toBe(true)
    if (rows[1].valid) {
      expect(rows[1].data.slug).toBe('bisnis-digital')
    }
  })

  it('returns error for invalid category', () => {
    const csv = `title,slug,category,description,file_path,cover_url,page_count,is_featured,is_published
Test,,InvalidCat,,https://drive.google.com/file/d/abc/view,,,false,false`
    const { rows } = parseCsv(csv)
    expect(rows[0].valid).toBe(false)
    if (!rows[0].valid) {
      expect(rows[0].error).toMatch(/Kategori/)
    }
  })

  it('returns error for invalid GDrive URL', () => {
    const csv = `title,slug,category,description,file_path,cover_url,page_count,is_featured,is_published
Test,,Bisnis,,https://example.com/not-gdrive,,,false,false`
    const { rows } = parseCsv(csv)
    expect(rows[0].valid).toBe(false)
    if (!rows[0].valid) {
      expect(rows[0].error).toMatch(/GDrive/)
    }
  })

  it('returns error for missing title', () => {
    const csv = `title,slug,category,description,file_path,cover_url,page_count,is_featured,is_published
,,Bisnis,,https://drive.google.com/file/d/abc/view,,,false,false`
    const { rows } = parseCsv(csv)
    expect(rows[0].valid).toBe(false)
    if (!rows[0].valid) {
      expect(rows[0].error).toMatch(/Judul/)
    }
  })

  it('returns globalError for CSV with more than 100 data rows', () => {
    const header = 'title,slug,category,description,file_path,cover_url,page_count,is_featured,is_published'
    const row = 'Test,,Bisnis,,https://drive.google.com/file/d/abc/view,,,false,false'
    const csv = [header, ...Array(101).fill(row)].join('\n')
    const { globalError } = parseCsv(csv)
    expect(globalError).toMatch(/100/)
  })

  it('skips fully empty rows', () => {
    const csv = `title,slug,category,description,file_path,cover_url,page_count,is_featured,is_published
Panduan,,Bisnis,,https://drive.google.com/file/d/abc/view,,,false,false
,,,,,,,,
Test2,,Prompt,,https://drive.google.com/file/d/def/view,,,false,false`
    const { rows } = parseCsv(csv)
    expect(rows).toHaveLength(2)
  })

  it('returns globalError for empty CSV', () => {
    const { globalError } = parseCsv('title,category\n')
    expect(globalError).toBeTruthy()
  })
})
