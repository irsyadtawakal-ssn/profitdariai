import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ketentuan Layanan',
  description: 'Ketentuan Layanan penggunaan platform Profit Dari AI.',
}

export default function KetentualLayananPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#F5F5F0]">
      {/* Header */}
      <div className="border-b border-[#222222] bg-[#111111]">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link href="/" className="text-[#D4AF37] text-sm hover:underline mb-4 inline-block">
            ← Kembali ke Beranda
          </Link>
          <h1 className="text-3xl font-bold text-[#F5F5F0] mt-2">Ketentuan Layanan</h1>
          <p className="text-[#888888] text-sm mt-2">Terakhir diperbarui: 28 Mei 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">1. Penerimaan Ketentuan</h2>
          <p className="text-[#888888] leading-relaxed">
            Dengan mengakses dan menggunakan platform Profit Dari AI (<strong className="text-[#F5F5F0]">profitdariai.com</strong>),
            kamu menyetujui untuk terikat oleh Ketentuan Layanan ini. Jika kamu tidak menyetujui ketentuan ini,
            harap tidak menggunakan platform kami.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">2. Deskripsi Layanan</h2>
          <p className="text-[#888888] leading-relaxed">
            Profit Dari AI adalah platform membership digital yang menyediakan akses ke kursus video, ebook,
            template, dan konten edukatif seputar monetisasi kecerdasan buatan (AI). Konten bersifat digital
            dan diakses secara online melalui akun anggota.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">3. Pendaftaran Akun</h2>
          <ul className="text-[#888888] leading-relaxed space-y-2 list-disc list-inside">
            <li>Kamu wajib memberikan informasi yang akurat dan lengkap saat mendaftar.</li>
            <li>Akun bersifat personal dan tidak dapat dipindahtangankan kepada pihak lain.</li>
            <li>Kamu bertanggung jawab menjaga kerahasiaan kata sandi akunmu.</li>
            <li>Kami berhak menonaktifkan akun yang melanggar ketentuan ini tanpa pemberitahuan sebelumnya.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">4. Hak Kekayaan Intelektual</h2>
          <p className="text-[#888888] leading-relaxed">
            Semua konten di platform ini — termasuk kursus, ebook, template, teks, gambar, dan video —
            adalah milik eksklusif Profit Dari AI dan dilindungi oleh hukum hak cipta Indonesia.
            Dilarang keras menyalin, mendistribusikan, menjual kembali, atau memodifikasi konten
            tanpa izin tertulis dari kami.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">5. Pembayaran</h2>
          <ul className="text-[#888888] leading-relaxed space-y-2 list-disc list-inside">
            <li>Harga yang ditampilkan sudah termasuk semua biaya dan dalam mata uang Rupiah (IDR).</li>
            <li>Pembayaran diproses secara aman melalui Tripay sebagai payment gateway.</li>
            <li>Akses membership aktif setelah pembayaran berhasil dikonfirmasi oleh sistem.</li>
            <li>Kami berhak mengubah harga sewaktu-waktu tanpa pemberitahuan sebelumnya.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">6. Batasan Tanggung Jawab</h2>
          <p className="text-[#888888] leading-relaxed">
            Platform ini disediakan &quot;sebagaimana adanya&quot;. Kami tidak menjamin hasil finansial tertentu
            dari penggunaan konten kami. Hasil yang ditampilkan adalah pengalaman nyata creator kami
            dan tidak menjadi jaminan bahwa kamu akan mendapatkan hasil yang sama.
            Keberhasilan bergantung pada usaha, konsistensi, dan faktor individu masing-masing pengguna.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">7. Perubahan Layanan</h2>
          <p className="text-[#888888] leading-relaxed">
            Kami berhak mengubah, memperbarui, atau menghentikan layanan sewaktu-waktu.
            Perubahan signifikan akan diberitahukan melalui email yang terdaftar di akunmu.
            Penggunaan platform setelah perubahan berlaku berarti kamu menyetujui ketentuan yang diperbarui.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">8. Hukum yang Berlaku</h2>
          <p className="text-[#888888] leading-relaxed">
            Ketentuan ini diatur oleh hukum Republik Indonesia. Setiap sengketa akan diselesaikan
            secara musyawarah. Jika tidak tercapai kesepakatan, akan diselesaikan melalui pengadilan
            yang berwenang di Indonesia.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">9. Hubungi Kami</h2>
          <p className="text-[#888888] leading-relaxed">
            Pertanyaan seputar Ketentuan Layanan dapat disampaikan melalui halaman{' '}
            <Link href="/kontak" className="text-[#D4AF37] hover:underline">Kontak Support</Link> kami.
          </p>
        </section>

        <div className="border-t border-[#222222] pt-8 flex flex-wrap gap-4 text-sm text-[#555555]">
          <Link href="/kebijakan-privasi" className="hover:text-[#D4AF37] transition-colors">Kebijakan Privasi</Link>
          <Link href="/kebijakan-refund" className="hover:text-[#D4AF37] transition-colors">Kebijakan Refund</Link>
          <Link href="/kontak" className="hover:text-[#D4AF37] transition-colors">Kontak Support</Link>
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">Beranda</Link>
        </div>
      </div>
    </main>
  )
}
