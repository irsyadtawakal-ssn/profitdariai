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
