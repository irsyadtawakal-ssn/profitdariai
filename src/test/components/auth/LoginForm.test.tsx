// src/test/components/auth/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/LoginForm'
import { vi } from 'vitest'

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('LoginForm', () => {
  it('renders email dan password fields', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('shows inline error jika email kosong saat submit', async () => {
    render(<LoginForm />)
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }))
    await waitFor(() => {
      expect(screen.getByText(/email tidak valid/i)).toBeInTheDocument()
    })
  })

  it('shows inline error jika password kurang dari 8 karakter', async () => {
    render(<LoginForm />)
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com')
    await userEvent.type(screen.getByLabelText(/password/i), '123')
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }))
    await waitFor(() => {
      expect(screen.getByText(/password minimal 8 karakter/i)).toBeInTheDocument()
    })
  })
})
