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
import { Turnstile } from '@marsidev/react-turnstile'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginFormData) {
    // Block submission if Turnstile is configured but token not yet received
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !captchaToken) {
      toast.error('Selesaikan verifikasi CAPTCHA terlebih dahulu.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
        options: captchaToken ? { captchaToken } : undefined,
      })

      if (error) {
        // AuthApiError: credentials salah, email belum verify, dll.
        if (error.message.toLowerCase().includes('invalid') || error.message.toLowerCase().includes('credentials')) {
          toast.error('Email atau password salah. Coba lagi.')
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          toast.error('Email belum dikonfirmasi. Cek inbox kamu.')
        } else {
          toast.error(error.message || 'Gagal masuk. Coba lagi.')
        }
        return
      }

      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user ?? null

      const { data: profile } = user
        ? await supabase.from('profiles').select('role').eq('id', user.id).single()
        : { data: null }

      toast.success('Berhasil masuk!')
      router.refresh()
      router.push(profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard')
    } catch (err) {
      console.error('[LoginForm] unexpected error:', err)
      // Cek apakah ini benar-benar network error
      if (err instanceof TypeError && err.message.includes('fetch')) {
        toast.error('Tidak dapat terhubung ke server. Periksa koneksi internet kamu.')
      } else {
        toast.error('Terjadi kesalahan. Silakan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Email Field */}
      <div className="space-y-1">
        <label htmlFor="email" className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#888888] block">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="kamu@email.com"
          autoComplete="email"
          className="w-full bg-transparent border-0 border-b border-gold/20 focus:border-gold py-3 px-0 font-mono text-sm text-gold placeholder:text-gold/25 focus:ring-0 transition-all rounded-none"
          {...register('email')}
        />
        {errors.email && (
          <p role="alert" className="mt-1 text-xs text-[#EF4444] font-mono">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1 relative">
        <div className="flex justify-between items-center">
          <label htmlFor="password" className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#888888] block">
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gold/60 hover:text-gold transition-colors flex items-center gap-1 group cursor-pointer"
            aria-label={showPassword ? 'Sembunyikan' : 'Tampilkan'}
          >
            <span className="font-mono text-[9px] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
              {showPassword ? 'SEMBUNYIKAN' : 'LIHAT'}
            </span>
            {showPassword ? <EyeOff className="h-4 w-4 shrink-0" /> : <Eye className="h-4 w-4 shrink-0" />}
          </button>
        </div>
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 8 karakter"
          autoComplete="current-password"
          className="w-full bg-transparent border-0 border-b border-gold/20 focus:border-gold py-3 px-0 font-mono text-sm text-gold placeholder:text-gold/25 focus:ring-0 transition-all rounded-none"
          {...register('password')}
        />
        {errors.password && (
          <p role="alert" className="mt-1 text-xs text-[#EF4444] font-mono">{errors.password.message}</p>
        )}
      </div>

      {/* Forgot Password */}
      <div className="flex justify-end">
        <Link
          href="/reset-password"
          className="font-mono text-[10px] uppercase tracking-wider text-[#888888] hover:text-gold transition-colors"
        >
          Lupa password?
        </Link>
      </div>

      {/* Cloudflare Turnstile */}
      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <div className="flex justify-center py-2">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={setCaptchaToken}
            onExpire={() => setCaptchaToken(null)}
            options={{ theme: 'dark' }}
          />
        </div>
      )}

      {/* Primary Action */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gold text-obsidian font-mono text-xs uppercase tracking-widest font-bold py-4 cyber-corner hover:brightness-110 active:scale-95 transition-all duration-300 shadow-lg shadow-gold/10 cursor-pointer disabled:opacity-50"
      >
        {loading ? 'MEMPROSES...' : 'MASUK'}
      </button>

      {/* Footer Links */}
      <footer className="text-center pt-2">
        <p className="font-sans text-xs text-[#888888]">
          Belum punya akun?{' '}
          <a href="https://lynk.id/spbaicreator/mmy8445nreq8" target="_blank" rel="noopener noreferrer" className="text-gold font-bold hover:underline transition-all">
            Beli sekarang
          </a>
        </p>
      </footer>
    </form>
  )
}

