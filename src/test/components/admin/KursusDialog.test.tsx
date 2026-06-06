import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { KursusDialog } from '@/app/(admin)/admin/kursus/KursusDialog'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/thumb.jpg' } }),
      }),
    },
  }),
}))

vi.mock('@/app/(admin)/admin/kursus/actions', () => ({
  createKursus: vi.fn().mockResolvedValue(undefined),
  updateKursus: vi.fn().mockResolvedValue(undefined),
}))

describe('KursusDialog', () => {
  it('renders add form when no course prop', () => {
    render(<KursusDialog open={true} onClose={vi.fn()} />)
    expect(screen.getByText('Tambah Kursus')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tambah/i })).toBeInTheDocument()
  })

  it('renders edit form with prefilled data', () => {
    const course = {
      id: 'abc',
      title: 'Kursus Test',
      slug: 'kursus-test',
      description: null,
      category: 'Bisnis',
      thumbnail_url: null,
      is_published: true,
    }
    render(<KursusDialog open={true} onClose={vi.fn()} course={course} />)
    expect(screen.getByText('Edit Kursus')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Kursus Test')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Bisnis')).toBeInTheDocument()
  })

  it('auto-generates slug from title on add', () => {
    render(<KursusDialog open={true} onClose={vi.fn()} />)
    const titleInput = screen.getByLabelText(/judul/i)
    fireEvent.change(titleInput, { target: { value: 'Kursus Baru!' } })
    expect(screen.getByDisplayValue('kursus-baru')).toBeInTheDocument()
  })

  it('calls onClose when Batal clicked', () => {
    const onClose = vi.fn()
    render(<KursusDialog open={true} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /batal/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
