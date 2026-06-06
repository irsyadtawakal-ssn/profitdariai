// src/test/components/auth/ResetPasswordForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { vi } from 'vitest'

const mockResetPassword = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPassword,
    },
  }),
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null }),
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    mockResetPassword.mockResolvedValue({ error: null })
  })

  it('renders email field', () => {
    render(<ResetPasswordForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('shows error jika email tidak valid', async () => {
    render(<ResetPasswordForm />)
    await userEvent.type(screen.getByLabelText(/email/i), 'bukan-email')
    fireEvent.click(screen.getByRole('button', { name: /kirim link/i }))
    await waitFor(() => {
      expect(screen.getByText(/email tidak valid/i)).toBeInTheDocument()
    })
  })

  it('disables button dan ubah text setelah submit berhasil', async () => {
    render(<ResetPasswordForm />)
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com')
    fireEvent.click(screen.getByRole('button', { name: /kirim link/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /link sudah dikirim/i })).toBeDisabled()
    })
  })
})
