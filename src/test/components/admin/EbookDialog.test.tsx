import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MateriDialog } from '@/app/(admin)/admin/materi/MateriDialog'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
      }),
    },
  }),
}))

vi.mock('@/app/(admin)/admin/materi/actions', () => ({
  createEbook: vi.fn().mockResolvedValue(undefined),
  updateEbook: vi.fn().mockResolvedValue(undefined),
}))

describe('MateriDialog', () => {
  it('renders add form', () => {
    render(<MateriDialog open={true} onClose={vi.fn()} />)
    expect(screen.getByText('Tambah Materi')).toBeInTheDocument()
  })

  it('renders edit form with prefilled data', () => {
    const ebook = {
      id: 'e1', title: 'Panduan AI', slug: 'panduan-ai',
      description: null, category: 'AI', cover_url: null,
      file_path: 'ebooks/test.pdf', page_count: 50, is_published: true,
      is_featured: false, videos: null, documents: null,
    }
    render(<MateriDialog open={true} onClose={vi.fn()} materi={ebook} />)
    expect(screen.getByText('Edit Materi')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Panduan AI')).toBeInTheDocument()
    expect(screen.getByText(/ebooks\/test\.pdf/)).toBeInTheDocument()
  })

  it('calls onClose on Batal', () => {
    const onClose = vi.fn()
    render(<MateriDialog open={true} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /batal/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
