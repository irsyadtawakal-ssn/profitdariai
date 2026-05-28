import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MarketplaceDialog } from '@/app/(admin)/admin/marketplace/MarketplaceDialog'

vi.mock('@/app/(admin)/admin/marketplace/actions', () => ({
  createProduct: vi.fn().mockResolvedValue(undefined),
  updateProduct: vi.fn().mockResolvedValue(undefined),
}))

describe('MarketplaceDialog', () => {
  it('renders add form', () => {
    render(<MarketplaceDialog open={true} onClose={vi.fn()} />)
    expect(screen.getByText('Tambah Produk')).toBeInTheDocument()
  })

  it('renders edit form with prefilled data', () => {
    const product = {
      id: 'p1',
      title: 'Template Canva Pro',
      slug: 'template-canva-pro',
      description: null,
      category: 'Template',
      price: 49000,
      original_price: 99000,
      cover_url: null,
      product_url: 'https://drive.google.com/uc?export=download&id=abc123',
      is_published: true,
    }
    render(<MarketplaceDialog open={true} onClose={vi.fn()} product={product} />)
    expect(screen.getByText('Edit Produk')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Template Canva Pro')).toBeInTheDocument()
  })

  it('calls onClose on Batal', () => {
    const onClose = vi.fn()
    render(<MarketplaceDialog open={true} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /batal/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('auto-generates slug from title on add mode', () => {
    render(<MarketplaceDialog open={true} onClose={vi.fn()} />)
    const titleInput = screen.getByLabelText('Nama Produk')
    fireEvent.change(titleInput, { target: { value: 'Template AI Keren' } })
    expect(screen.getByDisplayValue('template-ai-keren')).toBeInTheDocument()
  })
})
