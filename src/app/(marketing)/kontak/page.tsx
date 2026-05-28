import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Kontak Support',
  description: 'Hubungi tim support Profit Dari AI untuk bantuan, pertanyaan, atau pengajuan refund.',
}

export default function KontakPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#F5F5F0]">
      {/* Header */}
      <div className="border-b border-[#222222] bg-[#111111]">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link href="/" className="text-[#D4AF37] text-sm hover:underline mb-4 inline-block">
            ← Kembali ke Beranda
          </Link>
          <h1 className="text-3xl font-bold text-[#F5F5F0] mt-2">Kontak Support</h1>
          <p className="text-[#888888] text-sm mt-2">Kami siap membantu kamu — tim kami aktif Senin–Jumat, 09.00–17.00 WIB</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">

          {/* WhatsApp */}
          <a
            href="https://wa.me/628212638792"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-[#111111] border border-[#222222] rounded-xl p-6 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/5 transition-all"
          >
            <div className="text-3xl mb-3">💬</div>
            <h2 className="text-[#F5F5F0] font-bold text-lg mb-1 group-hover:text-[#D4AF37] transition-colors">WhatsApp</h2>
            <p className="text-[#888888] text-sm mb-3">Cara tercepat untuk mendapatkan bantuan langsung dari tim kami.</p>
            <span className="text-[#D4AF37] text-sm font-semibold">Chat Sekarang →</span>
          </a>

          {/* Email */}
          <a
            href="mailto:adimin@profitdariai.com"
            className="group bg-[#111111] border border-[#222222] rounded-xl p-6 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/5 transition-all"
          >
            <div className="text-3xl mb-3">📧</div>
            <h2 className="text-[#F5F5F0] font-bold text-lg mb-1 group-hover:text-[#D4AF37] transition-colors">Email</h2>
            <p className="text-[#888888] text-sm mb-3">Untuk pertanyaan detail, pengajuan refund, atau laporan masalah akun.</p>
            <span className="text-[#D4AF37] text-sm font-semibold">adimin@profitdariai.com</span>
          </a>

        </div>

        {/* FAQ links */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 mb-10">
          <h2 className="text-[#F5F5F0] font-bold text-lg mb-4">Pertanyaan yang Sering Ditanyakan</h2>
          <div className="space-y-3">
            {[
              { q: 'Bagaimana cara mengajukan refund?', href: '/kebijakan-refund' },
              { q: 'Apa saja ketentuan layanan platform ini?', href: '/ketentuan-layanan' },
              { q: 'Bagaimana data pribadi saya dilindungi?', href: '/kebijakan-privasi' },
            ].map(({ q, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]/20 border border-transparent transition-all group"
              >
                <span className="text-[#888888] group-hover:text-[#F5F5F0] transition-colors text-sm">{q}</span>
                <span className="text-[#D4AF37] text-sm">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Response time note */}
        <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl p-5 mb-6">
          <p className="text-[#888888] text-sm leading-relaxed">
            <strong className="text-[#D4AF37]">Estimasi waktu respons:</strong>{' '}
            WhatsApp biasanya direspons dalam 1–3 jam di jam kerja. Email biasanya direspons dalam 1x24 jam kerja.
            Untuk pertanyaan atau masalah akun, sertakan nama dan email akun kamu agar tim kami bisa membantu lebih cepat.
          </p>
        </div>

        {/* Anti-phishing notice */}
        <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-lg mt-0.5">🔒</span>
            <div>
              <p className="text-red-400 font-bold text-sm mb-2">Peringatan Keamanan</p>
              <p className="text-[#888888] text-sm leading-relaxed">
                Tim Profit dari AI <strong className="text-[#F5F5F0]">tidak pernah</strong> meminta password, data kartu kredit,
                atau kode OTP kamu melalui WhatsApp, email, atau media apapun.
                Jika ada yang mengaku sebagai tim kami dan meminta hal tersebut,
                itu adalah <strong className="text-red-400">penipuan</strong> — abaikan dan laporkan ke kami.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#222222] pt-8 mt-10 flex flex-wrap gap-4 text-sm text-[#555555]">
          <Link href="/ketentuan-layanan" className="hover:text-[#D4AF37] transition-colors">Ketentuan Layanan</Link>
          <Link href="/kebijakan-privasi" className="hover:text-[#D4AF37] transition-colors">Kebijakan Privasi</Link>
          <Link href="/kebijakan-refund" className="hover:text-[#D4AF37] transition-colors">Kebijakan Refund</Link>
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">Beranda</Link>
        </div>
      </div>
    </main>
  )
}
