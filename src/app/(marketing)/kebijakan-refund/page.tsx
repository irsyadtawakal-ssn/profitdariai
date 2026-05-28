import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kebijakan Refund',
  description: 'Kebijakan pengembalian dana (refund) platform Profit Dari AI.',
}

export default function KebijakanRefundPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#F5F5F0]">
      {/* Header */}
      <div className="border-b border-[#1a1a24] bg-[#08080c]">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link href="/" className="text-[#D4AF37] text-sm hover:underline mb-4 inline-block">
            ← Kembali ke Beranda
          </Link>
          <h1 className="text-3xl font-bold text-[#F5F5F0] mt-2">Kebijakan Refund</h1>
          <p className="text-[#888888] text-sm mt-2">Terakhir diperbarui: 28 Mei 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">

        {/* No Refund notice */}
        <div className="bg-[#111111] border border-[#1a1a24] rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-[#F5F5F0] font-bold text-lg mb-2">Tidak Ada Pengembalian Dana</p>
              <p className="text-[#94a3b8] leading-relaxed">
                Semua pembelian di platform Profit Dari AI bersifat <strong className="text-[#F5F5F0]">final dan tidak dapat dikembalikan</strong>.
                Dengan melakukan pembelian, kamu menyetujui kebijakan ini sepenuhnya.
              </p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">1. Alasan Kebijakan Ini</h2>
          <p className="text-[#94a3b8] leading-relaxed mb-3">
            Profit Dari AI menyediakan produk digital berupa kursus video, ebook, dan konten edukatif yang
            dapat diakses secara langsung setelah pembayaran berhasil dikonfirmasi. Karena sifat produk digital
            yang tidak dapat &quot;dikembalikan&quot; layaknya barang fisik, kami menerapkan kebijakan
            <strong className="text-[#F5F5F0]"> tanpa pengembalian dana</strong>.
          </p>
          <p className="text-[#94a3b8] leading-relaxed">
            Begitu akses diberikan, konten dapat langsung dinikmati, diunduh, dan digunakan — sehingga
            tidak dimungkinkan adanya pengembalian seperti pada produk fisik.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">2. Yang Termasuk dalam Pembelian</h2>
          <p className="text-[#94a3b8] leading-relaxed mb-3">
            Sebelum melakukan pembelian, pastikan kamu sudah memahami bahwa membership mencakup:
          </p>
          <ul className="text-[#94a3b8] leading-relaxed space-y-2 list-disc list-inside">
            <li>Akses ke semua kursus video AI yang tersedia dan yang akan ditambahkan.</li>
            <li>Akses ke semua ebook eksklusif dan template.</li>
            <li>Konten baru yang terus diperbarui setiap bulan.</li>
            <li>Sekali bayar, tanpa biaya tambahan di kemudian hari.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">3. Pertimbangkan Sebelum Membeli</h2>
          <p className="text-[#94a3b8] leading-relaxed mb-3">
            Kami sangat menyarankan kamu untuk:
          </p>
          <ul className="text-[#94a3b8] leading-relaxed space-y-2 list-disc list-inside">
            <li>Membaca deskripsi lengkap konten yang tersedia di halaman utama.</li>
            <li>Memastikan kamu memahami bahwa ini adalah produk digital.</li>
            <li>Menghubungi tim kami melalui halaman <Link href="/kontak" className="text-[#D4AF37] hover:underline">Kontak Support</Link> jika ada pertanyaan sebelum membeli.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">4. Masalah Teknis</h2>
          <p className="text-[#94a3b8] leading-relaxed">
            Jika kamu mengalami masalah teknis seperti tidak bisa mengakses akun setelah pembayaran berhasil,
            silakan hubungi tim support kami segera melalui halaman{' '}
            <Link href="/kontak" className="text-[#D4AF37] hover:underline">Kontak Support</Link>.
            Kami akan membantu menyelesaikan masalah akses secepatnya.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">5. Hubungi Kami</h2>
          <p className="text-[#94a3b8] leading-relaxed">
            Pertanyaan seputar kebijakan ini dapat disampaikan sebelum melakukan pembelian melalui halaman{' '}
            <Link href="/kontak" className="text-[#D4AF37] hover:underline">Kontak Support</Link> kami.
          </p>
        </section>

        <div className="border-t border-[#1a1a24] pt-8 flex flex-wrap gap-4 text-sm text-[#555555]">
          <Link href="/ketentuan-layanan" className="hover:text-[#D4AF37] transition-colors">Ketentuan Layanan</Link>
          <Link href="/kebijakan-privasi" className="hover:text-[#D4AF37] transition-colors">Kebijakan Privasi</Link>
          <Link href="/kontak" className="hover:text-[#D4AF37] transition-colors">Kontak Support</Link>
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">Beranda</Link>
        </div>
      </div>
    </main>
  )
}
