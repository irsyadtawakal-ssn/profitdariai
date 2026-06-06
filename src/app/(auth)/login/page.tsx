// src/app/(auth)/login/page.tsx
import type { Metadata } from 'next'
import { Logo } from '@/components/shared/Logo'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Masuk — ProfitDariAI' }

export default function LoginPage() {
  return (
    <div className="w-full max-w-[960px] mx-auto px-4 py-8">
      <div
        className="flex rounded-none overflow-hidden border border-[#1C1C1C] shadow-[0_0_120px_rgba(212,175,55,0.07),0_32px_80px_rgba(0,0,0,0.6)]"
        style={{ minHeight: '640px' }}
      >
        {/* ── LEFT: Abstract Art Panel ── */}
        <div
          className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-10 overflow-hidden"
          style={{
            background: `
              radial-gradient(ellipse 100% 65% at 10% 10%, rgba(212,175,55,0.50) 0%, transparent 52%),
              radial-gradient(ellipse 75% 95% at 88% 88%, rgba(184,134,11,0.42) 0%, transparent 52%),
              radial-gradient(ellipse 110% 55% at 52% 38%, rgba(150,95,8,0.30) 0%, transparent 62%),
              radial-gradient(circle at 8% 78%, rgba(90,55,4,0.36) 0%, transparent 38%),
              radial-gradient(ellipse 70% 55% at 78% 8%, rgba(240,195,65,0.20) 0%, transparent 48%),
              radial-gradient(circle at 50% 50%, rgba(30,18,2,0.6) 0%, transparent 80%),
              #060604
            `,
          }}
        >
          {/* Subtle noise grain */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '300px',
              mixBlendMode: 'overlay',
            }}
          />

          {/* Glow blobs */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '340px',
              height: '340px',
              background: 'radial-gradient(circle, rgba(212,175,55,0.28) 0%, transparent 70%)',
              filter: 'blur(72px)',
              top: '-100px',
              left: '-80px',
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '260px',
              height: '260px',
              background: 'radial-gradient(circle, rgba(180,130,10,0.22) 0%, transparent 70%)',
              filter: 'blur(56px)',
              bottom: '40px',
              right: '-60px',
            }}
          />

          {/* Decorative diagonal line accent */}
          <div
            className="absolute pointer-events-none opacity-20"
            style={{
              width: '1px',
              height: '200px',
              background: 'linear-gradient(to bottom, transparent, rgba(212,175,55,0.8), transparent)',
              top: '30%',
              right: '32px',
              transform: 'rotate(12deg)',
            }}
          />

          {/* Top label */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5">
              <span
                className="block h-px bg-[#D4AF37]"
                style={{ width: '28px', opacity: 0.6 }}
              />
              <span
                className="text-[#D4AF37] text-[10px] tracking-[0.25em] uppercase font-[family-name:var(--font-geist)] font-medium"
                style={{ opacity: 0.65 }}
              >
                Platform AI Indonesia
              </span>
            </div>
          </div>

          {/* Bottom quote */}
          <div className="relative z-10 space-y-5">
            <blockquote>
              <p className="text-[#F5F5F0] text-[2rem] font-bold leading-[1.18] tracking-tight font-[family-name:var(--font-geist)]">
                Mereka yang<br />
                belajar hari ini,<br />
                <span className="text-[#D4AF37]">memimpin</span> esok.
              </p>
            </blockquote>
            <p className="text-[#707070] text-[13px] leading-relaxed">
              Ratusan pelajar sudah mengubah pengetahuan AI<br />
              menjadi pendapatan nyata.
            </p>
          </div>
        </div>

        {/* ── RIGHT: Form Panel ── */}
        <div className="flex-1 bg-[#0A0A0A] flex flex-col justify-center px-8 lg:px-12 py-12">
          <div className="max-w-[360px] mx-auto w-full">
            {/* Logo */}
            <div className="mb-10">
              <Logo size="lg" />
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-[1.6rem] font-bold text-[#F5F5F0] tracking-tight font-[family-name:var(--font-geist)] mb-2">
                Selamat datang kembali
              </h1>
              <p className="text-[13px] text-[#555555] leading-relaxed">
                Masukkan email dan password untuk<br />
                akses kursus & ebook eksklusifmu
              </p>
            </div>

            {/* Form */}
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
