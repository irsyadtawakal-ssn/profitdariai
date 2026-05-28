import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'FAQ — Pertanyaan yang Sering Ditanyakan',
  description: 'Jawaban atas pertanyaan umum seputar platform Profit Dari AI — membership, pembayaran, akses konten, dan keamanan akun.',
}

const FAQS = [
  {
    category: 'Membership & Akses',
    items: [
      {
        q: 'Apa yang saya dapatkan setelah bergabung?',
        a: 'Akses penuh ke semua kursus video AI, semua ebook & template prompt eksklusif, serta konten baru yang terus ditambahkan setiap bulan. Sekali bayar, tidak ada biaya bulanan.',
      },
      {
        q: 'Berapa lama akses berlaku?',
        a: 'Akses berlaku sangat lama — tidak ada batasan waktu dalam praktiknya. Selama platform berjalan, kamu bisa akses semua konten.',
      },
      {
        q: 'Apakah konten terus diupdate?',
        a: 'Ya. Kursus dan ebook baru ditambahkan secara berkala. Kamu tidak perlu bayar lagi untuk konten baru — sudah termasuk dalam membership.',
      },
      {
        q: 'Bisa diakses dari perangkat apa saja?',
        a: 'Bisa dari HP, tablet, laptop, atau PC — selama ada browser dan koneksi internet. Tidak perlu install aplikasi khusus.',
      },
    ],
  },
  {
    category: 'Pembayaran',
    items: [
      {
        q: 'Metode pembayaran apa yang tersedia?',
        a: 'Transfer bank (BCA, Mandiri, BNI, BRI), QRIS, dan dompet digital (GoPay, OVO, Dana) via Tripay — payment gateway berlisensi Bank Indonesia.',
      },
      {
        q: 'Setelah bayar, kapan akun aktif?',
        a: 'Otomatis aktif begitu pembayaran terkonfirmasi — biasanya dalam hitungan menit. Tidak perlu konfirmasi manual.',
      },
      {
        q: 'Bagaimana kalau pembayaran berhasil tapi akun belum aktif?',
        a: 'Hubungi kami via WhatsApp atau email dengan bukti pembayaran (screenshot/nomor referensi). Kami akan aktifkan manual dalam 1x24 jam.',
      },
      {
        q: 'Apakah harga bisa naik?',
        a: 'Ya. Harga Rp 199.000 adalah harga early bird untuk 100 member pertama. Daftar sekarang untuk kunci harga terbaik.',
      },
    ],
  },
  {
    category: 'Konten & Belajar',
    items: [
      {
        q: 'Apakah cocok untuk pemula yang belum tahu AI?',
        a: 'Ya, 100% cocok. Semua materi dirancang dari nol, step-by-step. Tidak perlu background teknis atau coding.',
      },
      {
        q: 'Tools AI apa yang dibutuhkan?',
        a: 'Sebagian besar menggunakan ChatGPT, Claude, dan Canva AI — banyak yang tersedia gratis. Semua tools dijelaskan lengkap beserta alternatif gratisnya.',
      },
      {
        q: 'Berapa lama sampai bisa menghasilkan uang?',
        a: 'Bergantung pada konsistensi. Dengan mengikuti framework di platform ini, pemula bisa mulai membuat produk pertama dalam beberapa hari dan mendapat penjualan pertama dalam minggu pertama.',
      },
      {
        q: 'Apakah ada sesi live atau hanya video rekaman?',
        a: 'Saat ini semua konten berbentuk video on-demand dan ebook yang bisa diakses kapan saja. Tidak ada jadwal tetap.',
      },
    ],
  },
  {
    category: 'Keamanan Akun',
    items: [
      {
        q: 'Bagaimana cara menjaga keamanan akun saya?',
        a: 'Gunakan password yang kuat dan unik (berbeda dari password di platform lain). Jangan bagikan password ke siapapun — termasuk yang mengaku tim support kami.',
      },
      {
        q: 'Apakah tim Profit dari AI pernah minta password saya?',
        a: 'TIDAK PERNAH. Kami tidak akan pernah meminta password, kode OTP, atau data kartu kredit kamu melalui WhatsApp, email, atau media apapun. Jika ada yang mengaku tim kami dan meminta hal itu, segera abaikan — itu penipuan.',
      },
      {
        q: 'Bagaimana kalau saya lupa password?',
        a: 'Klik "Lupa Password" di halaman login. Link reset password akan dikirim ke email kamu. Jika email tidak masuk, cek folder spam.',
      },
      {
        q: 'Apakah data saya aman?',
        a: 'Data disimpan dengan enkripsi menggunakan Supabase (infrastruktur berbasis AWS). Kami tidak menyimpan data kartu kredit — semua pembayaran diproses oleh Tripay, payment gateway berlisensi Bank Indonesia. Detail lengkap di Kebijakan Privasi.',
      },
    ],
  },
  {
    category: 'Refund & Kebijakan',
    items: [
      {
        q: 'Apakah ada refund?',
        a: 'Tidak ada pengembalian dana untuk produk digital. Pastikan kamu sudah membaca deskripsi lengkap konten sebelum membeli. Jika ada masalah teknis akses, hubungi support kami — kami akan bantu selesaikan.',
      },
      {
        q: 'Bagaimana kalau konten tidak sesuai ekspektasi?',
        a: 'Kami sarankan untuk menghubungi support sebelum membeli jika ada pertanyaan spesifik. Setelah pembelian, tidak ada refund sesuai kebijakan produk digital kami.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#F5F5F0]">
      {/* Header */}
      <div className="border-b border-[#222222] bg-[#111111]">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link href="/" className="text-[#D4AF37] text-sm hover:underline mb-4 inline-block">
            ← Kembali ke Beranda
          </Link>
          <h1 className="text-3xl font-bold text-[#F5F5F0] mt-2">Pertanyaan yang Sering Ditanyakan</h1>
          <p className="text-[#888888] text-sm mt-2">
            Tidak menemukan jawaban? Hubungi kami di{' '}
            <Link href="/kontak" className="text-[#D4AF37] hover:underline">halaman kontak</Link>.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">

        {/* Security notice */}
        <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-5 flex items-start gap-3">
          <span className="text-red-400 text-lg mt-0.5 flex-shrink-0">🔒</span>
          <div>
            <p className="text-red-400 font-bold text-sm mb-1">Peringatan Keamanan</p>
            <p className="text-[#888888] text-sm leading-relaxed">
              Kami <strong className="text-[#F5F5F0]">tidak pernah</strong> meminta password atau kode OTP kamu.
              Waspadai penipuan yang mengatasnamakan Profit dari AI.
            </p>
          </div>
        </div>

        {FAQS.map(({ category, items }) => (
          <section key={category}>
            <h2 className="text-lg font-bold text-[#D4AF37] mb-4 pb-2 border-b border-[#222222]">
              {category}
            </h2>
            <div className="space-y-4">
              {items.map(({ q, a }) => (
                <div key={q} className="bg-[#111111] border border-[#222222] rounded-xl p-5">
                  <p className="text-[#F5F5F0] font-semibold text-sm mb-2">{q}</p>
                  <p className="text-[#888888] text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* CTA */}
        <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl p-6 text-center">
          <p className="text-[#F5F5F0] font-semibold mb-2">Masih ada pertanyaan?</p>
          <p className="text-[#888888] text-sm mb-4">Tim kami siap membantu kamu.</p>
          <Link
            href="/kontak"
            className="inline-block bg-[#D4AF37] text-[#0A0A0A] font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-[#D4AF37]/90 transition-colors"
          >
            Hubungi Support →
          </Link>
        </div>

        <div className="border-t border-[#222222] pt-8 flex flex-wrap gap-4 text-sm text-[#555555]">
          <Link href="/ketentuan-layanan" className="hover:text-[#D4AF37] transition-colors">Ketentuan Layanan</Link>
          <Link href="/kebijakan-privasi" className="hover:text-[#D4AF37] transition-colors">Kebijakan Privasi</Link>
          <Link href="/kebijakan-refund" className="hover:text-[#D4AF37] transition-colors">Kebijakan Refund</Link>
          <Link href="/kontak" className="hover:text-[#D4AF37] transition-colors">Kontak</Link>
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">Beranda</Link>
        </div>
      </div>
    </main>
  )
}
