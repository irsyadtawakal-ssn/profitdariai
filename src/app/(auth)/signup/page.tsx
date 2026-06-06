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

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-none p-8">
        <SignupForm />
      </div>
    </div>
  )
}
