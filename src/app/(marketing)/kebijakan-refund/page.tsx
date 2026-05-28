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

        {/* Highlight box */}
        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/40 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="text-[#D4AF37] font-bold text-lg mb-1">Jaminan Kepuasan 7 Hari</p>
              <p className="text-[#94a3b8] leading-relaxed">
                Kami memberikan jaminan kepuasan selama <strong className="text-[#F5F5F0]">7 hari kalender</strong> sejak
                tanggal pembelian. Jika kamu tidak puas dengan konten kami, ajukan permintaan refund
                melalui halaman kontak kami dan kami akan memproses pengembalian dana sepenuhnya.
              </p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">1. Syarat Pengajuan Refund</h2>
          <p className="text-[#94a3b8] leading-relaxed mb-3">
            Refund dapat diajukan jika memenuhi seluruh syarat berikut:
          </p>
          <ul className="text-[#94a3b8] leading-relaxed space-y-2 list-disc list-inside">
            <li>Permintaan diajukan dalam <strong className="text-[#F5F5F0]">7 hari kalender</strong> sejak tanggal transaksi berhasil.</li>
            <li>Memberikan alasan yang jelas mengapa kamu merasa tidak puas dengan layanan.</li>
            <li>Akun belum mengakses lebih dari 30% total konten yang tersedia di platform.</li>
            <li>Transaksi dilakukan secara langsung melalui platform <strong className="text-[#F5F5F0]">profitdariai.com</strong>.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">2. Cara Mengajukan Refund</h2>
          <ol className="text-[#94a3b8] leading-relaxed space-y-3 list-decimal list-inside">
            <li>
              Hubungi kami melalui halaman{' '}
              <Link href="/kontak" className="text-[#D4AF37] hover:underline">Kontak Support</Link>{' '}
              atau email ke <strong className="text-[#F5F5F0]">support@profitdariai.com</strong>.
            </li>
            <li>Sertakan <strong className="text-[#F5F5F0]">nama lengkap, email akun, nomor referensi transaksi</strong>, dan alasan pengajuan refund.</li>
            <li>Tim kami akan merespons dalam <strong className="text-[#F5F5F0]">1x24 jam kerja</strong> untuk memverifikasi permintaanmu.</li>
            <li>Setelah verifikasi disetujui, refund akan diproses dalam <strong className="text-[#F5F5F0]">3-7 hari kerja</strong> ke metode pembayaran asal.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">3. Kasus yang Tidak Dapat Direfund</h2>
          <ul className="text-[#94a3b8] leading-relaxed space-y-2 list-disc list-inside">
            <li>Permintaan diajukan setelah periode 7 hari berakhir.</li>
            <li>Akun telah mengakses lebih dari 30% konten platform.</li>
            <li>Terdapat indikasi penyalahgunaan kebijakan refund (pengajuan berulang).</li>
            <li>Pembayaran dilakukan melalui pihak ketiga yang tidak resmi.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">4. Proses Pengembalian Dana</h2>
          <p className="text-[#94a3b8] leading-relaxed mb-3">
            Dana dikembalikan melalui metode pembayaran yang digunakan saat transaksi:
          </p>
          <div className="bg-[#111111] border border-[#1a1a24] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#1a1a24]">
                <tr>
                  <th className="px-4 py-3 text-left text-[#D4AF37] font-semibold">Metode Pembayaran</th>
                  <th className="px-4 py-3 text-left text-[#D4AF37] font-semibold">Estimasi Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a24]">
                <tr>
                  <td className="px-4 py-3 text-[#94a3b8]">QRIS / E-Wallet (OVO, Dana, ShopeePay)</td>
                  <td className="px-4 py-3 text-[#94a3b8]">1–3 hari kerja</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-[#94a3b8]">Virtual Account (BCA, Mandiri, BNI, BRI)</td>
                  <td className="px-4 py-3 text-[#94a3b8]">3–7 hari kerja</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[#555555] text-xs mt-3">
            * Waktu pemrosesan dapat bervariasi tergantung kebijakan bank/penyedia e-wallet masing-masing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-3">5. Pertanyaan</h2>
          <p className="text-[#94a3b8] leading-relaxed">
            Jika ada pertanyaan seputar kebijakan refund, jangan ragu menghubungi kami melalui halaman{' '}
            <Link href="/kontak" className="text-[#D4AF37] hover:underline">Kontak Support</Link>{' '}
            atau email ke <strong className="text-[#F5F5F0]">support@profitdariai.com</strong>.
            Tim kami siap membantu kamu.
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
