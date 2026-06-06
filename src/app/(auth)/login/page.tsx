// src/app/(auth)/login/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Masuk — Profit Dari AI' }

export default function LoginPage() {
  return (
    <main className="w-full max-w-[1100px] min-h-[700px] flex flex-col md:flex-row overflow-hidden glass-panel relative border border-gold/15 m-4 md:m-8">
      {/* Left Side: Cinematic Branding */}
      <section className="relative w-full md:w-1/2 min-h-[350px] md:min-h-full flex flex-col justify-end p-8 overflow-hidden border-b md:border-b-0 md:border-r border-gold/10">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            alt="Neural data tree golden cyberpunk aesthetic"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            src="https://lh3.googleusercontent.com/aida/AP1WRLvSIhA_iy_qAmYgQwSXRGKTydOXOfY8pqGhEI5QZxFrkx8yidFFLewsnTw3OtmdC4QToBDyfVcf-rv2ztJlCDBLYUYW6145Yec5Hl0G1ztTkG8uRw26HQihcHKCZfLW4C7nTrs9zZasv-tL3C2jXnUl4iqG6eQWNwipBZ7tWmUMcSDjDZuSnyqmjbl4fnYjd7KAR-Dj_LVZxfuJlXZUq8ni_sKHtJDIT3y3zAw3IziAailqWeCH1v38_g"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/45 to-transparent" />
        </div>

        {/* Content Over Image */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-[2px] bg-gold"></span>
            <span className="font-mono text-[9px] text-gold tracking-[0.2em] font-semibold uppercase">
              PLATFORM AI INDONESIA
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl lg:text-4xl text-ivory max-w-sm leading-tight">
            Mereka yang belajar hari ini, <span className="text-gold italic">memimpin esok.</span>
          </h1>
          <p className="font-sans text-xs text-[#888888] max-w-xs leading-relaxed">
            Ratusan pelajar sudah mengubah pengetahuan AI menjadi pendapatan nyata.
          </p>
        </div>
      </section>

      {/* Right Side: Minimal Login Form */}
      <section className="w-full md:w-1/2 bg-[#111111]/90 p-8 md:p-16 flex flex-col justify-center relative">
        {/* Branding Header */}
        <div className="absolute top-8 left-8 md:top-12 md:left-16">
          <Link href="/" className="font-display text-xl font-extrabold text-gold tracking-tight hover:opacity-90 transition-opacity">
            profitdariai
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto space-y-8 mt-12 md:mt-0">
          {/* Title Block */}
          <header className="space-y-2">
            <h3 className="font-display text-xl md:text-2xl font-bold text-ivory">Selamat datang kembali</h3>
            <p className="font-sans text-xs text-[#888888] leading-relaxed">
              Masukkan email dan password untuk akses kursus & ebook eksklusifmu
            </p>
          </header>

          {/* Login Form */}
          <LoginForm />
        </div>
      </section>
    </main>
  )
}
