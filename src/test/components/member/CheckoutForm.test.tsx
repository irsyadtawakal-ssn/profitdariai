import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CheckoutForm } from '@/components/member/CheckoutForm'
import { vi } from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('CheckoutForm', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ checkout_url: 'https://tripay.co.id/checkout/test' }),
    })
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, href: '' } as Location)
  })

  it('renders QRIS as default selected method', () => {
    render(<CheckoutForm />)
    const qris = screen.getByRole('radio', { name: /QRIS/i })
    expect(qris).toBeChecked()
  })

  it('renders all payment methods', () => {
    render(<CheckoutForm />)
    expect(screen.getByRole('radio', { name: /QRIS/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /OVO/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /BCA/i })).toBeInTheDocument()
  })

  it('renders order summary with correct price', () => {
    render(<CheckoutForm />)
    expect(screen.getByText(/Rp 399\.000/)).toBeInTheDocument()
  })

  it('calls /api/payment/create on submit', async () => {
    render(<CheckoutForm />)
    await userEvent.click(screen.getByRole('button', { name: /Bayar Sekarang/i }))
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/payment/create', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"paymentMethod":"QRIS"'),
      }))
    })
  })

  it('shows error message on API failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Gagal membuat transaksi' }),
    })
    render(<CheckoutForm />)
    await userEvent.click(screen.getByRole('button', { name: /Bayar Sekarang/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Gagal membuat transaksi/)
    })
  })
})
