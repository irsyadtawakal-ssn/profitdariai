// src/test/components/auth/SignupForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupForm } from '@/components/auth/SignupForm'
import { vi } from 'vitest'

const mockSignUp = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
    },
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('SignupForm', () => {
  beforeEach(() => {
    mockSignUp.mockResolvedValue({ error: null })
  })

  it('renders semua fields', () => {
    render(<SignupForm />)
    expect(screen.getByLabelText(/nama lengkap/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/konfirmasi password/i)).toBeInTheDocument()
  })

  it('shows error jika password tidak cocok', async () => {
    render(<SignupForm />)
    await userEvent.type(screen.getByLabelText(/nama lengkap/i), 'Budi')
    await userEvent.type(screen.getByLabelText(/email/i), 'budi@test.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
    await userEvent.type(screen.getByLabelText(/konfirmasi password/i), 'password456')
    fireEvent.click(screen.getByRole('button', { name: /buat akun/i }))
    await waitFor(() => {
      expect(screen.getByText(/password tidak cocok/i)).toBeInTheDocument()
    })
  })

  it('shows error jika nama kurang dari 2 karakter', async () => {
    render(<SignupForm />)
    await userEvent.type(screen.getByLabelText(/nama lengkap/i), 'A')
    fireEvent.click(screen.getByRole('button', { name: /buat akun/i }))
    await waitFor(() => {
      expect(screen.getByText(/nama minimal 2 karakter/i)).toBeInTheDocument()
    })
  })

  it('calls signUp with correct data (without confirm_password) on valid submit', async () => {
    const mockPush = vi.fn()
    vi.mocked(vi.importMock ?? vi.fn)
    render(<SignupForm />)
    await userEvent.type(screen.getByLabelText(/nama lengkap/i), 'Budi Santoso')
    await userEvent.type(screen.getByLabelText(/email/i), 'budi@test.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
    await userEvent.type(screen.getByLabelText(/konfirmasi password/i), 'password123')
    fireEvent.click(screen.getByRole('button', { name: /buat akun/i }))
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'budi@test.com',
          password: 'password123',
          options: expect.objectContaining({
            data: { full_name: 'Budi Santoso' },
          }),
        })
      )
      // confirm_password must NOT be sent to Supabase
      const callArg = mockSignUp.mock.calls[0][0]
      expect(callArg).not.toHaveProperty('confirm_password')
    })
  })
})
