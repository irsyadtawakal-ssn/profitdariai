// src/components/auth/ResetPasswordForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetFormData>({ resolver: zodResolver(resetSchema) })

  useEffect(() => {
    const email = searchParams.get('email')
    if (email) setValue('email', email)
  }, [searchParams, setValue])

  async function onSubmit(data: ResetFormData) {
    setLoading(true)
    try {
      const supabase = createClient()

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')}/api/auth/callback?next=/reset-password/confirm`,
      })

      if (error) {
        toast.error('Gagal mengirim email. Coba lagi.')
        return
      }

      toast.success('Link reset sudah dikirim. Cek inbox kamu.')
      setSent(true)
    } catch {
      toast.error('Terjadi kesalahan jaringan. Periksa koneksi kamu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
          <p role="alert" className="mt-1 text-xs text-[#EF4444]">{errors.email.message}</p>
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
