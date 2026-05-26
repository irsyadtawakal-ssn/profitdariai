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
    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        toast.error('Email atau password salah. Coba lagi.')
        return
      }

      toast.success('Berhasil masuk!')
      router.push('/dashboard')
    } catch {
      toast.error('Terjadi kesalahan jaringan. Periksa koneksi kamu.')
    } finally {
      setLoading(false)
    }
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
            autoComplete="current-password"
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
