import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Kebijakan Privasi platform Profit Dari AI — bagaimana kami mengumpulkan dan melindungi data kamu.',
}

export default function KebijakanPrivasiPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#F5F5F0]">
      {/* Header */}
      <div className="border-b border-[#1a1a24] bg-[#08080c]">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link href="/" className="text-[#D4AF37] text-sm hover:underline mb-4 inline-block">
            ← Kembali ke Beranda
          </Link>
          <h1 className="text-3xl font-bold text-[#F5F5F0] mt-2">Kebijakan Privasi</h1>
          <p className="text-[#888888] text-sm mt-2">Terakhir diperbarui: 28 Mei 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">1. Informasi yang Kami Kumpulkan</h2>
          <p className="text-[#94a3b8] leading-relaxed mb-3">
            Saat kamu menggunakan platform Profit Dari AI, kami mengumpulkan informasi berikut:
          </p>
          <ul className="text-[#94a3b8] leading-relaxed space-y-2 list-disc list-inside">
            <li><strong className="text-[#F5F5F0]">Informasi Akun:</strong> nama lengkap dan alamat email yang kamu berikan saat mendaftar atau checkout.</li>
            <li><strong className="text-[#F5F5F0]">Data Transaksi:</strong> referensi pembayaran, metode pembayaran, dan status transaksi (tidak termasuk nomor kartu atau detail sensitif pembayaran).</li>
            <li><strong className="text-[#F5F5F0]">Data Penggunaan:</strong> halaman yang dikunjungi, kursus yang diakses, dan waktu sesi untuk meningkatkan kualitas layanan.</li>
            <li><strong className="text-[#F5F5F0]">Data Teknis:</strong> alamat IP, jenis browser, dan perangkat yang digunakan secara anonim.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">2. Cara Kami Menggunakan Data</h2>
          <ul className="text-[#94a3b8] leading-relaxed space-y-2 list-disc list-inside">
            <li>Mengaktifkan dan mengelola akun membership kamu.</li>
            <li>Mengirimkan email konfirmasi pembayaran dan link akses akun.</li>
            <li>Mengirimkan notifikasi penting terkait layanan (bukan spam atau iklan tanpa izin).</li>
            <li>Meningkatkan performa dan kualitas konten platform.</li>
            <li>Memenuhi kewajiban hukum yang berlaku.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">3. Penyimpanan & Keamanan Data</h2>
          <p className="text-[#94a3b8] leading-relaxed">
            Data kamu disimpan dengan aman menggunakan layanan Supabase dengan enkripsi data at-rest dan in-transit.
            Kami menggunakan protokol HTTPS untuk semua komunikasi di platform. Kami tidak pernah menyimpan
            detail kartu kredit atau informasi pembayaran sensitif — semua transaksi diproses oleh Tripay
            sebagai payment gateway berlisensi Bank Indonesia.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">4. Berbagi Data dengan Pihak Ketiga</h2>
          <p className="text-[#94a3b8] leading-relaxed mb-3">
            Kami <strong className="text-[#F5F5F0]">tidak menjual</strong> data pribadimu kepada pihak ketiga manapun.
            Data hanya dibagikan kepada:
          </p>
          <ul className="text-[#94a3b8] leading-relaxed space-y-2 list-disc list-inside">
            <li><strong className="text-[#F5F5F0]">Tripay</strong> — untuk memproses pembayaran (nama dan email saja).</li>
            <li><strong className="text-[#F5F5F0]">Supabase</strong> — sebagai penyedia infrastruktur database.</li>
            <li><strong className="text-[#F5F5F0]">Pihak berwenang</strong> — jika diwajibkan oleh hukum yang berlaku.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">5. Hak Kamu atas Data</h2>
          <ul className="text-[#94a3b8] leading-relaxed space-y-2 list-disc list-inside">
            <li><strong className="text-[#F5F5F0]">Akses:</strong> kamu berhak meminta salinan data pribadi yang kami miliki.</li>
            <li><strong className="text-[#F5F5F0]">Koreksi:</strong> kamu berhak memperbarui data yang tidak akurat.</li>
            <li><strong className="text-[#F5F5F0]">Penghapusan:</strong> kamu berhak meminta penghapusan akun dan data, kecuali data yang wajib kami simpan secara hukum.</li>
            <li><strong className="text-[#F5F5F0]">Berhenti berlangganan email:</strong> kamu bisa berhenti menerima email marketing kapan saja.</li>
          </ul>
          <p className="text-[#94a3b8] leading-relaxed mt-3">
            Untuk menjalankan hak-hak ini, hubungi kami melalui halaman{' '}
            <Link href="/kontak" className="text-[#D4AF37] hover:underline">Kontak Support</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">6. Cookies</h2>
          <p className="text-[#94a3b8] leading-relaxed">
            Platform kami menggunakan cookies fungsional untuk menjaga sesi login kamu tetap aktif.
            Kami tidak menggunakan cookies pihak ketiga untuk pelacakan iklan. Kamu dapat menonaktifkan
            cookies melalui pengaturan browser, namun hal ini mungkin mempengaruhi fungsi platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">7. Perubahan Kebijakan</h2>
          <p className="text-[#94a3b8] leading-relaxed">
            Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu. Perubahan akan diberitahukan
            melalui email atau notifikasi di platform. Tanggal pembaruan terakhir selalu ditampilkan
            di bagian atas halaman ini.
          </p>
        </section>

        <div className="border-t border-[#1a1a24] pt-8 flex flex-wrap gap-4 text-sm text-[#555555]">
          <Link href="/ketentuan-layanan" className="hover:text-[#D4AF37] transition-colors">Ketentuan Layanan</Link>
          <Link href="/kebijakan-refund" className="hover:text-[#D4AF37] transition-colors">Kebijakan Refund</Link>
          <Link href="/kontak" className="hover:text-[#D4AF37] transition-colors">Kontak Support</Link>
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">Beranda</Link>
        </div>
      </div>
    </main>
  )
}
