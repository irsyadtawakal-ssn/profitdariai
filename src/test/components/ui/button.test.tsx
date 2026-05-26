import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { describe, it, expect, vi } from 'vitest'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Mulai Sekarang</Button>)
    expect(screen.getByText('Mulai Sekarang')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Klik</Button>)
    fireEvent.click(screen.getByText('Klik'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled').closest('button')).toBeDisabled()
  })

  it('renders secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByText('Secondary')).toBeInTheDocument()
  })

  it('renders ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByText('Ghost')).toBeInTheDocument()
  })

  it('is disabled when loading is true', () => {
    render(<Button loading>Simpan</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not call onClick when loading', () => {
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>Simpan</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('shows spinner when loading', () => {
    render(<Button loading>Simpan</Button>)
    expect(screen.getByRole('button').querySelector('svg')).toBeTruthy()
  })
})
