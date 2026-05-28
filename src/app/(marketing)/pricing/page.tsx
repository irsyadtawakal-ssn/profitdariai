import Link from 'next/link'

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-20">
      <div className="text-center mb-12 max-w-xl">
        <h1 className="text-4xl font-bold text-[#F5F5F0] mb-4">
          Satu Harga. Akses Penuh.
        </h1>
        <p className="text-[#888888] text-lg">
          Semua kursus & ebook AI dalam satu membership tahunan.
        </p>
      </div>

      <div className="w-full max-w-sm border border-[#D4AF37]/40 rounded-2xl bg-[#111111] p-8 relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-[#0A0A0A] text-xs font-bold px-4 py-1 rounded-full">
          EARLY BIRD — 100 MEMBER PERTAMA
        </div>

        <div className="text-center mb-8">
          <div className="text-[#888888] text-sm line-through mb-1">Rp 399.000/tahun</div>
          <div className="text-5xl font-bold text-[#D4AF37]">Rp 299.000</div>
          <div className="text-[#888888] text-sm mt-1">per tahun</div>
        </div>

        <ul className="space-y-3 mb-8">
          {[
            'Akses semua kursus AI (terus bertambah)',
            'Akses semua ebook eksklusif',
            'Update konten seumur hidup membership',
            'Download ebook tanpa batas',
            'Komunitas member private',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-[#F5F5F0]">
              <span className="text-[#D4AF37] mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <Link
          href="/checkout"
          className="block w-full text-center bg-[#D4AF37] text-[#0A0A0A] font-bold py-3 rounded-xl hover:bg-[#D4AF37]/90 transition-colors"
        >
          Mulai Sekarang →
        </Link>

        <p className="text-center text-[#555555] text-xs mt-4">
          SSL Aman · 7 Hari Uang Kembali · Diproses via Tripay
        </p>
      </div>

      <p className="text-[#555555] text-sm mt-8">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-[#D4AF37] hover:underline">
          Masuk di sini
        </Link>
      </p>
    </main>
  )
}
