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
})
