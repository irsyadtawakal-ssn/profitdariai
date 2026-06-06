import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CheckoutForm } from '@/components/member/CheckoutForm'
import { vi } from 'vitest'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

const mockFetch = vi.fn()
global.fetch = mockFetch

function mockFetchResponses() {
  mockFetch.mockImplementation((url: string) => {
    if (String(url).includes('/api/payment/fee')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: { total_fee: { customer: 0 } } }),
      })
    }
    return Promise.resolve({
      ok: true,
      json: async () => ({ checkout_url: 'https://tripay.co.id/checkout/test' }),
    })
  })
}

describe('CheckoutForm', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockFetchResponses()
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, href: '' },
    })
  })

  it('renders QRIS group open by default', () => {
    render(<CheckoutForm />)
    expect(screen.getAllByText('QRIS').length).toBeGreaterThan(0)
  })

  it('renders all payment group labels', () => {
    render(<CheckoutForm />)
    expect(screen.getAllByText('QRIS').length).toBeGreaterThan(0)
    expect(screen.getByText('E-Wallet')).toBeInTheDocument()
    expect(screen.getByText('Virtual Account')).toBeInTheDocument()
  })

  it('renders order summary with correct base price', () => {
    render(<CheckoutForm />)
    // Rp 199.000 appears in summary — use getAllByText since it may appear in multiple places
    const priceEls = screen.getAllByText(/Rp\s*199/)
    expect(priceEls.length).toBeGreaterThan(0)
  })

  it('calls /api/payment/create on submit', async () => {
    render(<CheckoutForm />)
    await userEvent.type(screen.getByPlaceholderText(/Nama kamu/i), 'Budi Santoso')
    await userEvent.type(screen.getByPlaceholderText(/email@example.com/i), 'budi@test.com')
    await userEvent.click(screen.getByRole('button', { name: /Bayar Sekarang/i }))
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/payment/create', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"paymentMethod":"QRIS"'),
      }))
    })
  })

  it('shows error message on API failure', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (String(url).includes('/api/payment/fee')) {
        return Promise.resolve({ ok: true, json: async () => ({ data: { total_fee: { customer: 0 } } }) })
      }
      return Promise.resolve({ ok: false, json: async () => ({ error: 'Gagal membuat transaksi' }) })
    })
    render(<CheckoutForm />)
    await userEvent.type(screen.getByPlaceholderText(/Nama kamu/i), 'Budi Santoso')
    await userEvent.type(screen.getByPlaceholderText(/email@example.com/i), 'budi@test.com')
    await userEvent.click(screen.getByRole('button', { name: /Bayar Sekarang/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Gagal membuat transaksi/)
    })
  })

  it('shows fallback error on network failure', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (String(url).includes('/api/payment/fee')) {
        return Promise.resolve({ ok: true, json: async () => ({ data: { total_fee: { customer: 0 } } }) })
      }
      return Promise.reject(new Error('network'))
    })
    render(<CheckoutForm />)
    await userEvent.type(screen.getByPlaceholderText(/Nama kamu/i), 'Budi Santoso')
    await userEvent.type(screen.getByPlaceholderText(/email@example.com/i), 'budi@test.com')
    await userEvent.click(screen.getByRole('button', { name: /Bayar Sekarang/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Gagal membuat transaksi/)
    })
  })
})
