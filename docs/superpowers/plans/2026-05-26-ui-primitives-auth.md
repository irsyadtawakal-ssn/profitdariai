# UI Primitives + Auth Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build branded UI primitives (Button, Card, Input, Label, Badge, Dialog) dan auth pages (Login, Signup, Reset Password) menggunakan Shadcn/ui + Supabase Auth.

**Architecture:** Install Shadcn/ui, override CSS variables di globals.css dengan brand palette profitdariai (gold/obsidian/ivory). Komponen di `src/components/ui/` jadi single source of truth. Auth forms pakai react-hook-form + zod, field error inline, server error via Sonner toast.

**Tech Stack:** Next.js 16, Tailwind 4, Shadcn/ui, react-hook-form, zod, Sonner, Supabase Auth, Vitest, @testing-library/react

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `vitest.config.ts` | Create | Vitest config dengan jsdom + @/ alias |
| `src/test/setup.ts` | Create | jest-dom matchers setup |
| `src/app/globals.css` | Modify | Brand CSS variables (shadcn mapping) |
| `src/app/layout.tsx` | Modify | Add Sonner `<Toaster>` |
| `components.json` | Create (shadcn init) | Shadcn config |
| `src/components/ui/button.tsx` | Create (shadcn) | Button primitive |
| `src/components/ui/card.tsx` | Create (shadcn) | Card primitive |
| `src/components/ui/input.tsx` | Create (shadcn) | Input primitive |
| `src/components/ui/label.tsx` | Create (shadcn) | Label primitive |
| `src/components/ui/badge.tsx` | Create (shadcn) | Badge primitive |
| `src/components/ui/dialog.tsx` | Create (shadcn) | Dialog/Modal primitive |
| `src/components/shared/Logo.tsx` | Create | Logo wordmark component |
| `src/components/auth/LoginForm.tsx` | Create | Login form dengan validation |
| `src/components/auth/SignupForm.tsx` | Create | Signup form dengan validation |
| `src/components/auth/ResetPasswordForm.tsx` | Create | Reset password form |
| `src/app/(auth)/login/page.tsx` | Modify | Wire LoginForm |
| `src/app/(auth)/signup/page.tsx` | Modify | Wire SignupForm |
| `src/app/(auth)/reset-password/page.tsx` | Modify | Wire ResetPasswordForm |
| `src/test/components/ui/button.test.tsx` | Create | Button tests |
| `src/test/components/auth/LoginForm.test.tsx` | Create | LoginForm tests |
| `src/test/components/auth/SignupForm.test.tsx` | Create | SignupForm tests |
| `src/test/components/auth/ResetPasswordForm.test.tsx` | Create | ResetPasswordForm tests |

---

## Task 1: Test Infrastructure Setup

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Modify: `package.json` (add test script + @testing-library/jest-dom)

- [ ] **Step 1: Install @testing-library/jest-dom**

```bash
pnpm add -D @testing-library/jest-dom --ignore-scripts
```

Expected output: `+ @testing-library/jest-dom x.x.x`

- [ ] **Step 2: Create vitest.config.ts**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Create src/test/setup.ts**

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Add test script ke package.json**

Tambah di `"scripts"`:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 5: Verify setup berjalan**

```bash
pnpm test:run
```

Expected: `No test files found` (bukan error, karena belum ada test file)

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts src/test/setup.ts package.json
git commit -m "chore: setup vitest + testing-library for component tests"
```

---

## Task 2: Shadcn/ui Init + Brand CSS Variables

**Files:**
- Create: `components.json` (auto-generated shadcn)
- Modify: `src/app/globals.css`

- [ ] **Step 1: Jalankan shadcn init**

```bash
pnpm dlx shadcn@latest init -d
```

Pilih saat diminta:
- Style: `Default`
- Base color: `Neutral`
- CSS variables: `Yes`

Flag `-d` menggunakan default untuk semua prompt. Jika masih ada prompt interaktif, jawab sesuai di atas.

- [ ] **Step 2: Verifikasi components.json terbuat**

```bash
cat components.json
```

Expected: ada field `style`, `tailwind`, `aliases`.

- [ ] **Step 3: Override CSS variables di globals.css**

Buka `src/app/globals.css`. Tambahkan section berikut **setelah** `@import "tailwindcss"` dan **sebelum** `@theme inline` yang sudah ada:

```css
@layer base {
  :root {
    /* shadcn CSS variable mapping → profitdariai brand */
    --background: #0A0A0A;
    --foreground: #F5F5F0;
    --card: #1A1A1A;
    --card-foreground: #F5F5F0;
    --popover: #1A1A1A;
    --popover-foreground: #F5F5F0;
    --primary: #D4AF37;
    --primary-foreground: #0A0A0A;
    --secondary: #1A1A1A;
    --secondary-foreground: #F5F5F0;
    --muted: #1A1A1A;
    --muted-foreground: #888888;
    --accent: #1A1A1A;
    --accent-foreground: #F5F5F0;
    --destructive: #EF4444;
    --destructive-foreground: #F5F5F0;
    --border: #2A2A2A;
    --input: #0A0A0A;
    --ring: rgba(212, 175, 55, 0.3);
    --radius: 0.5rem;
  }
}
```

- [ ] **Step 4: Verifikasi dev server masih jalan tanpa error**

```bash
pnpm dev
```

Buka http://localhost:3000 — tidak ada error di console.

- [ ] **Step 5: Commit**

```bash
git add components.json src/app/globals.css
git commit -m "feat: shadcn/ui init + brand CSS variables (gold/obsidian/ivory)"
```

---

## Task 3: Button Component

**Files:**
- Create: `src/components/ui/button.tsx` (via shadcn, lalu custom)
- Create: `src/test/components/ui/button.test.tsx`

- [ ] **Step 1: Install Button via shadcn**

```bash
pnpm dlx shadcn@latest add button --overwrite
```

- [ ] **Step 2: Tulis failing test**

```typescript
// src/test/components/ui/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

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
})
```

- [ ] **Step 3: Run test — pastikan fail**

```bash
pnpm test:run src/test/components/ui/button.test.tsx
```

Expected: FAIL (komponen belum dikustomisasi, atau PASS jika shadcn sudah install)

- [ ] **Step 4: Kustomisasi button.tsx sesuai brand**

Buka `src/components/ui/button.tsx`. Pastikan `cva` variants-nya seperti ini:

```typescript
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#A88A2B] hover:shadow-[0_0_32px_rgba(212,175,55,0.3)] hover:-translate-y-px',
        secondary:
          'bg-transparent text-[#F5F5F0] border border-[#2A2A2A] hover:border-[#D4AF37] hover:text-[#D4AF37]',
        ghost:
          'bg-transparent text-[#888888] hover:text-[#F5F5F0]',
        destructive:
          'bg-[#EF4444] text-white hover:bg-[#DC2626]',
      },
      size: {
        sm: 'h-8 px-4 text-sm rounded-md',
        md: 'h-11 px-6 text-base rounded-lg',
        lg: 'h-13 px-7 text-base rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {children}
          </span>
        ) : children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

- [ ] **Step 5: Run test — pastikan pass**

```bash
pnpm test:run src/test/components/ui/button.test.tsx
```

Expected: PASS (5 tests)

- [ ] **Step 6: Install class-variance-authority jika belum ada**

```bash
pnpm add class-variance-authority --ignore-scripts
```

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/button.tsx src/test/components/ui/button.test.tsx package.json pnpm-lock.yaml
git commit -m "feat: Button component — primary/secondary/ghost variants + loading state"
```

---

## Task 4: Input + Label Components

**Files:**
- Create: `src/components/ui/input.tsx` (via shadcn, lalu custom)
- Create: `src/components/ui/label.tsx` (via shadcn, lalu custom)

- [ ] **Step 1: Install via shadcn**

```bash
pnpm dlx shadcn@latest add input label --overwrite
```

- [ ] **Step 2: Kustomisasi input.tsx sesuai brand**

```typescript
// src/components/ui/input.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg border bg-[#0A0A0A] px-4 py-3 text-sm text-[#F5F5F0] placeholder:text-[#888888]',
          'transition-all duration-200 outline-none',
          'focus:border-[#D4AF37] focus:ring-3 focus:ring-[rgba(212,175,55,0.1)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-[#EF4444] ring-3 ring-[rgba(239,68,68,0.1)]'
            : 'border-[#2A2A2A]',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
```

- [ ] **Step 3: Kustomisasi label.tsx sesuai brand**

```typescript
// src/components/ui/label.tsx
import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { error?: boolean }
>(({ className, error, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'text-sm font-medium leading-none mb-1.5 block',
      error ? 'text-[#EF4444]' : 'text-[#F5F5F0]',
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
```

- [ ] **Step 4: Verifikasi di dev server**

Buka http://localhost:3000 — tidak ada compile error.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/input.tsx src/components/ui/label.tsx
git commit -m "feat: Input + Label components — brand styled with error states"
```

---

## Task 5: Card Component

**Files:**
- Create: `src/components/ui/card.tsx` (via shadcn, lalu custom)

- [ ] **Step 1: Install via shadcn**

```bash
pnpm dlx shadcn@latest add card --overwrite
```

- [ ] **Step 2: Kustomisasi card.tsx**

```typescript
// src/components/ui/card.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-6',
        'transition-all duration-200',
        interactive && 'cursor-pointer hover:border-[#D4AF37] hover:shadow-[0_0_24px_rgba(212,175,55,0.1)]',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight text-[#F5F5F0]', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm text-[#888888]', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center justify-end gap-2 mt-4', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardContent, CardFooter }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/card.tsx
git commit -m "feat: Card component — default + interactive variant with gold hover"
```

---

## Task 6: Badge Component

**Files:**
- Create: `src/components/ui/badge.tsx` (via shadcn, lalu custom)

- [ ] **Step 1: Install via shadcn**

```bash
pnpm dlx shadcn@latest add badge --overwrite
```

- [ ] **Step 2: Kustomisasi badge.tsx**

```typescript
// src/components/ui/badge.tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors border',
  {
    variants: {
      variant: {
        gold: 'bg-[rgba(212,175,55,0.15)] text-[#D4AF37] border-[rgba(212,175,55,0.3)]',
        muted: 'bg-[#1A1A1A] text-[#888888] border-[#2A2A2A]',
        success: 'bg-[rgba(34,197,94,0.15)] text-[#22C55E] border-[rgba(34,197,94,0.3)]',
        warning: 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B] border-[rgba(245,158,11,0.3)]',
        destructive: 'bg-[rgba(239,68,68,0.15)] text-[#EF4444] border-[rgba(239,68,68,0.3)]',
      },
    },
    defaultVariants: {
      variant: 'gold',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/badge.tsx
git commit -m "feat: Badge component — gold/muted/success/warning/destructive variants"
```

---

## Task 7: Dialog (Modal) Component

**Files:**
- Create: `src/components/ui/dialog.tsx` (via shadcn, lalu custom)

- [ ] **Step 1: Install via shadcn**

```bash
pnpm dlx shadcn@latest add dialog --overwrite
```

- [ ] **Step 2: Pastikan overlay + content sesuai brand**

Buka `src/components/ui/dialog.tsx`. Cari `DialogOverlay` dan `DialogContent`, pastikan class-nya seperti ini:

```typescript
const DialogOverlay = React.forwardRef<...>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
))

const DialogContent = React.forwardRef<...>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
        'w-full max-w-lg border border-[#2A2A2A] bg-[#1A1A1A] rounded-2xl p-6 shadow-lg',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm text-[#888888] opacity-70 hover:opacity-100 hover:text-[#F5F5F0] transition-opacity">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
```

Pastikan ada import `X` dari `lucide-react` di atas file.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/dialog.tsx
git commit -m "feat: Dialog component — branded overlay + content with gold border"
```

---

## Task 8: Logo + Sonner Toaster Setup

**Files:**
- Create: `src/components/shared/Logo.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Buat Logo component**

```typescript
// src/components/shared/Logo.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

const sizeMap = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
}

export function Logo({ className, size = 'md', href = '/' }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        'font-bold text-[#D4AF37] tracking-tight hover:opacity-80 transition-opacity',
        sizeMap[size],
        className
      )}
    >
      profitdariai
    </Link>
  )
}
```

- [ ] **Step 2: Tambah Sonner Toaster ke root layout**

Buka `src/app/layout.tsx`. Tambah import dan `<Toaster />`:

```typescript
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

// ... metadata ...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.className} h-full`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              color: '#F5F5F0',
            },
          }}
        />
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Verifikasi dev server**

```bash
pnpm dev
```

Buka http://localhost:3000 — tidak ada error.

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/Logo.tsx src/app/layout.tsx
git commit -m "feat: Logo component + Sonner Toaster setup in root layout"
```

---

## Task 9: LoginForm + Login Page

**Files:**
- Create: `src/components/auth/LoginForm.tsx`
- Modify: `src/app/(auth)/login/page.tsx`
- Create: `src/test/components/auth/LoginForm.test.tsx`

- [ ] **Step 1: Tulis failing test**

```typescript
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
```

- [ ] **Step 2: Run test — pastikan fail**

```bash
pnpm test:run src/test/components/auth/LoginForm.test.tsx
```

Expected: FAIL karena `LoginForm` belum ada.

- [ ] **Step 3: Buat LoginForm.tsx**

```typescript
// src/components/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginFormData) {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast.error('Email atau password salah. Coba lagi.')
      setLoading(false)
      return
    }

    toast.success('Berhasil masuk!')
    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email" error={!!errors.email}>Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="kamu@email.com"
          autoComplete="email"
          error={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-[#EF4444]">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password" error={!!errors.password}>Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 karakter"
            autoComplete="current-password"
            error={!!errors.password}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#F5F5F0] transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-[#EF4444]">{errors.password.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Link
          href="/reset-password"
          className="text-sm text-[#888888] hover:text-[#D4AF37] transition-colors"
        >
          Lupa password?
        </Link>
      </div>

      <Button type="submit" size="lg" loading={loading} className="w-full">
        Masuk
      </Button>

      {/* SLOT: Google OAuth — Phase 2 */}
      {/* <Button type="button" variant="secondary" className="w-full">
        <GoogleIcon /> Masuk dengan Google
      </Button> */}

      <p className="text-center text-sm text-[#888888]">
        Belum punya akun?{' '}
        <Link href="/signup" className="text-[#D4AF37] hover:underline font-medium">
          Daftar sekarang
        </Link>
      </p>
    </form>
  )
}
```

- [ ] **Step 4: Update Login page**

```typescript
// src/app/(auth)/login/page.tsx
import type { Metadata } from 'next'
import { Logo } from '@/components/shared/Logo'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Masuk' }

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <Logo size="lg" className="mb-6 inline-block" />
        <h1 className="text-2xl font-bold text-[#F5F5F0] tracking-tight">
          Masuk ke akunmu
        </h1>
        <p className="mt-2 text-sm text-[#888888]">
          Akses kursus & ebook eksklusif kamu
        </p>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8">
        <LoginForm />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run test — pastikan pass**

```bash
pnpm test:run src/test/components/auth/LoginForm.test.tsx
```

Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add src/components/auth/LoginForm.tsx src/app/(auth)/login/page.tsx src/test/components/auth/LoginForm.test.tsx
git commit -m "feat: LoginForm + Login page — email/password auth dengan Supabase"
```

---

## Task 10: SignupForm + Signup Page

**Files:**
- Create: `src/components/auth/SignupForm.tsx`
- Modify: `src/app/(auth)/signup/page.tsx`
- Create: `src/test/components/auth/SignupForm.test.tsx`

- [ ] **Step 1: Tulis failing test**

```typescript
// src/test/components/auth/SignupForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupForm } from '@/components/auth/SignupForm'
import { vi } from 'vitest'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('SignupForm', () => {
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
```

- [ ] **Step 2: Run test — pastikan fail**

```bash
pnpm test:run src/test/components/auth/SignupForm.test.tsx
```

Expected: FAIL karena `SignupForm` belum ada.

- [ ] **Step 3: Buat SignupForm.tsx**

```typescript
// src/components/auth/SignupForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

const signupSchema = z
  .object({
    full_name: z.string().min(2, 'Nama minimal 2 karakter'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Password tidak cocok',
    path: ['confirm_password'],
  })

type SignupFormData = z.infer<typeof signupSchema>

export function SignupForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) })

  async function onSubmit(data: SignupFormData) {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
      },
    })

    if (error) {
      toast.error(
        error.message.includes('already registered')
          ? 'Email sudah terdaftar. Coba masuk.'
          : 'Gagal membuat akun. Coba lagi.'
      )
      setLoading(false)
      return
    }

    toast.success('Cek email kamu untuk verifikasi!')
    router.push('/login')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="full_name" error={!!errors.full_name}>Nama Lengkap</Label>
        <Input
          id="full_name"
          type="text"
          placeholder="Nama kamu"
          autoComplete="name"
          error={!!errors.full_name}
          {...register('full_name')}
        />
        {errors.full_name && (
          <p className="mt-1 text-xs text-[#EF4444]">{errors.full_name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email" error={!!errors.email}>Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="kamu@email.com"
          autoComplete="email"
          error={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-[#EF4444]">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password" error={!!errors.password}>Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 karakter"
            autoComplete="new-password"
            error={!!errors.password}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#F5F5F0] transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-[#EF4444]">{errors.password.message}</p>
        )}
        {!errors.password && (
          <p className="mt-1 text-xs text-[#888888]">Minimal 8 karakter</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirm_password" error={!!errors.confirm_password}>
          Konfirmasi Password
        </Label>
        <Input
          id="confirm_password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Ulangi password"
          autoComplete="new-password"
          error={!!errors.confirm_password}
          {...register('confirm_password')}
        />
        {errors.confirm_password && (
          <p className="mt-1 text-xs text-[#EF4444]">{errors.confirm_password.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
        Buat Akun
      </Button>

      {/* SLOT: Google OAuth — Phase 2 */}

      <p className="text-center text-sm text-[#888888]">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-[#D4AF37] hover:underline font-medium">
          Masuk
        </Link>
      </p>
    </form>
  )
}
```

- [ ] **Step 4: Update Signup page**

```typescript
// src/app/(auth)/signup/page.tsx
import type { Metadata } from 'next'
import { Logo } from '@/components/shared/Logo'
import { SignupForm } from '@/components/auth/SignupForm'

export const metadata: Metadata = { title: 'Daftar' }

export default function SignupPage() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <Logo size="lg" className="mb-6 inline-block" />
        <h1 className="text-2xl font-bold text-[#F5F5F0] tracking-tight">
          Buat akun baru
        </h1>
        <p className="mt-2 text-sm text-[#888888]">
          Bergabung dan mulai belajar cuan dari AI
        </p>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8">
        <SignupForm />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run test — pastikan pass**

```bash
pnpm test:run src/test/components/auth/SignupForm.test.tsx
```

Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add src/components/auth/SignupForm.tsx src/app/(auth)/signup/page.tsx src/test/components/auth/SignupForm.test.tsx
git commit -m "feat: SignupForm + Signup page — daftar akun dengan verifikasi email"
```

---

## Task 11: ResetPasswordForm + Reset Password Page

**Files:**
- Create: `src/components/auth/ResetPasswordForm.tsx`
- Modify: `src/app/(auth)/reset-password/page.tsx`
- Create: `src/test/components/auth/ResetPasswordForm.test.tsx`

- [ ] **Step 1: Tulis failing test**

```typescript
// src/test/components/auth/ResetPasswordForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { vi } from 'vitest'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}))

describe('ResetPasswordForm', () => {
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

  it('disables button setelah submit berhasil', async () => {
    render(<ResetPasswordForm />)
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com')
    fireEvent.click(screen.getByRole('button', { name: /kirim link/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /link sudah dikirim/i })).toBeDisabled()
    })
  })
})
```

- [ ] **Step 2: Run test — pastikan fail**

```bash
pnpm test:run src/test/components/auth/ResetPasswordForm.test.tsx
```

Expected: FAIL karena `ResetPasswordForm` belum ada.

- [ ] **Step 3: Buat ResetPasswordForm.tsx**

```typescript
// src/components/auth/ResetPasswordForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

const resetSchema = z.object({
  email: z.string().email('Email tidak valid'),
})

type ResetFormData = z.infer<typeof resetSchema>

export function ResetPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({ resolver: zodResolver(resetSchema) })

  async function onSubmit(data: ResetFormData) {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password/confirm`,
    })

    if (error) {
      toast.error('Gagal mengirim email. Coba lagi.')
      setLoading(false)
      return
    }

    toast.success('Link reset sudah dikirim. Cek inbox kamu.')
    setSent(true)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email" error={!!errors.email}>Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="kamu@email.com"
          autoComplete="email"
          error={!!errors.email}
          disabled={sent}
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-[#EF4444]">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        loading={loading}
        disabled={sent}
        className="w-full"
      >
        {sent ? 'Link Sudah Dikirim' : 'Kirim Link Reset'}
      </Button>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[#888888] hover:text-[#D4AF37] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke login
        </Link>
      </div>
    </form>
  )
}
```

- [ ] **Step 4: Update Reset Password page**

```typescript
// src/app/(auth)/reset-password/page.tsx
import type { Metadata } from 'next'
import { Logo } from '@/components/shared/Logo'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = { title: 'Reset Password' }

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <Logo size="lg" className="mb-6 inline-block" />
        <h1 className="text-2xl font-bold text-[#F5F5F0] tracking-tight">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-[#888888]">
          Masukkan emailmu, kami kirim link reset.
        </p>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8">
        <ResetPasswordForm />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run semua tests**

```bash
pnpm test:run
```

Expected: PASS semua tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/auth/ResetPasswordForm.tsx src/app/(auth)/reset-password/page.tsx src/test/components/auth/ResetPasswordForm.test.tsx
git commit -m "feat: ResetPasswordForm + Reset Password page — kirim link reset via Supabase"
```

---

## Task 12: TypeScript Check + Final Push

- [ ] **Step 1: TypeScript check**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Run semua tests**

```bash
pnpm test:run
```

Expected: semua pass.

- [ ] **Step 3: Test manual di browser**

```bash
pnpm dev
```

Cek:
- [ ] `http://localhost:3000/login` — tampil form login dengan brand dark
- [ ] `http://localhost:3000/signup` — tampil form signup
- [ ] `http://localhost:3000/reset-password` — tampil form reset
- [ ] Submit form kosong → inline error muncul
- [ ] Logo `profitdariai` tampil gold, clickable

- [ ] **Step 4: Push final**

```bash
git push
```
