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
    try {
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
        return
      }

      toast.success('Cek email kamu untuk verifikasi!')
      router.push('/login')
    } catch {
      toast.error('Terjadi kesalahan jaringan. Periksa koneksi kamu.')
    } finally {
      setLoading(false)
    }
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
          <p role="alert" className="mt-1 text-xs text-[#EF4444]">{errors.full_name.message}</p>
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
          <p role="alert" className="mt-1 text-xs text-[#EF4444]">{errors.email.message}</p>
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
            aria-label={showPassword ? 'Sembunyikan' : 'Tampilkan'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p role="alert" className="mt-1 text-xs text-[#EF4444]">{errors.password.message}</p>
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
          <p role="alert" className="mt-1 text-xs text-[#EF4444]">{errors.confirm_password.message}</p>
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
