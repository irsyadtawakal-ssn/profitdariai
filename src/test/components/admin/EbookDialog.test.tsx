import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EbookDialog } from '@/app/(admin)/admin/ebook/EbookDialog'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
      }),
    },
  }),
}))

vi.mock('@/app/(admin)/admin/ebook/actions', () => ({
  createEbook: vi.fn().mockResolvedValue(undefined),
  updateEbook: vi.fn().mockResolvedValue(undefined),
}))

describe('EbookDialog', () => {
  it('renders add form', () => {
    render(<EbookDialog open={true} onClose={vi.fn()} />)
    expect(screen.getByText('Tambah Ebook')).toBeInTheDocument()
  })

  it('renders edit form with prefilled data', () => {
    const ebook = {
      id: 'e1', title: 'Panduan AI', slug: 'panduan-ai',
      description: null, category: 'AI', cover_url: null,
      file_path: 'ebooks/test.pdf', page_count: 50, is_published: true,
    }
    render(<EbookDialog open={true} onClose={vi.fn()} ebook={ebook} />)
    expect(screen.getByText('Edit Ebook')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Panduan AI')).toBeInTheDocument()
    expect(screen.getByText(/ebooks\/test\.pdf/)).toBeInTheDocument()
  })

  it('calls onClose on Batal', () => {
    const onClose = vi.fn()
    render(<EbookDialog open={true} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /batal/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
