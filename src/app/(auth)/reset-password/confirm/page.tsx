// src/app/(auth)/reset-password/confirm/page.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

const confirmSchema = z
  .object({
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Password tidak cocok',
    path: ['confirm_password'],
  })

type ConfirmFormData = z.infer<typeof confirmSchema>

export default function ResetPasswordConfirmPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmFormData>({ resolver: zodResolver(confirmSchema) })

  async function onSubmit(data: ConfirmFormData) {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: data.password })

      if (error) {
        toast.error('Gagal mengubah password. Coba lagi.')
        return
      }

      toast.success('Password berhasil diubah!')
      router.refresh()
      router.push('/login')
    } catch {
      toast.error('Terjadi kesalahan. Periksa koneksi kamu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <Logo size="lg" className="mb-6 inline-block" />
        <h1 className="text-2xl font-bold text-[#F5F5F0] tracking-tight">
          Buat password baru
        </h1>
        <p className="mt-2 text-sm text-[#888888]">
          Masukkan password baru kamu di bawah.
        </p>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="password" error={!!errors.password}>Password Baru</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 karakter"
              autoComplete="new-password"
              error={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p role="alert" className="mt-1 text-xs text-[#EF4444]">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirm_password" error={!!errors.confirm_password}>
              Konfirmasi Password
            </Label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="Ulangi password baru"
              autoComplete="new-password"
              error={!!errors.confirm_password}
              {...register('confirm_password')}
            />
            {errors.confirm_password && (
              <p role="alert" className="mt-1 text-xs text-[#EF4444]">{errors.confirm_password.message}</p>
            )}
          </div>

          <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
            Simpan Password Baru
          </Button>
        </form>
      </div>
    </div>
  )
}
