// src/app/(auth)/reset-password/page.tsx
import { Suspense } from 'react'
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
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
