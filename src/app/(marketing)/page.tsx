'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import './landing.css'

export default function LandingPage() {
  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById('scrollProgress')
      if (!el) return
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      el.style.width = ((window.scrollY / scrollHeight) * 100) + '%'
    }
    window.addEventListener('scroll', handleScroll)

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.12 })
    document.querySelectorAll('.fade-up').forEach(el => obs.observe(el))

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <Script
        src="https://unpkg.com/lucide@latest"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).lucide) {
            (window as any).lucide.createIcons()
          }
        }}
      />

      <div id="cuan-ai-lp">
        <div className="scroll-progress" id="scrollProgress" />

        {/* TOP BAR */}
        <div className="topbar">
          <span>
            <i data-lucide="zap" style={{ width: 14, height: 14, color: 'var(--gold)', fill: 'var(--gold)', verticalAlign: 'middle', marginRight: 4 }} />
            {' '}<span className="blink">EARLY BIRD</span> — Akses Penuh Rp 199K — Harga Naik Setelah 100 Member Pertama!
          </span>
        </div>

        {/* NAV */}
        <nav>
          <div className="logo">
            <img src="/logo.png" alt="Logo" className="logo-icon" />
            <span style={{ whiteSpace: 'nowrap' }}>Profit dari <span>AI</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a href="/login" style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)', textDecoration: 'none', padding: '8px 18px', border: '1.5px solid var(--gold)', borderRadius: 8, transition: 'all 0.2s', letterSpacing: '0.03em' }}>Masuk</a>
            <a href="#pricing" className="cta-nav">DAPATKAN AKSES</a>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-center container">
            <div className="tag">
              <i data-lucide="cpu" style={{ width: 14, height: 14 }} /> Panduan Praktis 100% AI
            </div>
            <h1>
              <span className="prefix">[ Ebook &amp; Template ]</span>
              Cara Hasilkan <span className="accent">Rp 74 Juta</span> dari Produk Digital Buatan AI
            </h1>
            <p className="sub-center">Buat sekali, jual berkali-kali, cuan mengalir. Panduan langkah-demi-langkah dari nol hingga punya penghasilan pasif nyata dengan bantuan AI — tanpa skill teknis, tanpa modal besar.</p>
            <div className="hero-btns-center">
              <a href="/checkout" className="btn-primary">
                <i data-lucide="sparkles" style={{ width: 18, height: 18 }} /> Ya, Saya Mau Mulai Sekarang!
              </a>
            </div>
            <p className="hero-bullets-center">
              <span><i data-lucide="check-circle" style={{ width: 14, height: 14 }} /> Akses penuh</span>
              <span>·</span>
              <span><i data-lucide="check-circle" style={{ width: 14, height: 14 }} /> Semua kursus & ebook</span>
              <span>·</span>
              <span><i data-lucide="check-circle" style={{ width: 14, height: 14 }} /> Update konten gratis</span>
            </p>
            <div className="hero-ebook-single" style={{ marginTop: 50, display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div style={{ width: '100%', maxWidth: 460, border: '3px solid var(--gold)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 15px 45px rgba(0,0,0,0.8), var(--shadow-glow)' }}>
                <img src="https://belajarpakai.ai/wp-content/uploads/2026/05/ChatGPT-Image-May-21-2026-12_38_47-PM-1.png" alt="Ebook Cara Cuan Dari AI" style={{ width: '100%', display: 'block', height: 'auto' }} loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* TICKER */}
        <div className="ledger-ticker-wrap">
          <div className="ticker-track">
            {[
              ['dollar-sign', 'TOTAL OMZET: RP 74.700.000'],
              ['trending-up', 'TOTAL ORDERS: 1.494'],
              ['zap', 'HIGHEST CONVERSION: 20.53%'],
              ['book-open', '49 HALAMAN PANDUAN LENGKAP'],
              ['layers', '13 BAB STRATEGI PRAKTIS'],
              ['lightbulb', 'TEMPLATE PROMPT SIAP PAKAI'],
              ['eye', 'TOTAL VIEWS: 9.749 VIEWS'],
              ['download', 'DOWNLOAD INSTAN & AKSES PENUH'],
              ['dollar-sign', 'TOTAL OMZET: RP 74.700.000'],
              ['trending-up', 'TOTAL ORDERS: 1.494'],
              ['zap', 'HIGHEST CONVERSION: 20.53%'],
              ['book-open', '49 HALAMAN PANDUAN LENGKAP'],
              ['layers', '13 BAB STRATEGI PRAKTIS'],
              ['lightbulb', 'TEMPLATE PROMPT SIAP PAKAI'],
              ['eye', 'TOTAL VIEWS: 9.749 VIEWS'],
              ['download', 'DOWNLOAD INSTAN & AKSES PENUH'],
            ].map(([icon, text], i) => (
              <div key={i} className="ticker-item">
                <i data-lucide={icon} /> {text}
              </div>
            ))}
          </div>
        </div>

        {/* PROOF */}
        <section className="proof-section" id="proof">
          <div className="container fade-up">
            <div className="center" style={{ marginBottom: 30 }}>
              <div className="tag"><i data-lucide="bar-chart-3" style={{ width: 14, height: 14 }} /> Bukti Nyata</div>
              <h2>Hasil Yang <span style={{ color: 'var(--gold)' }}>Sudah Terbukti</span></h2>
            </div>
            <div className="proof-numbers">
              {[
                ['74.7Jt', 'Total penjualan dalam IDR'],
                ['1,494', 'Total order sukses'],
                ['20.53%', 'Konversi tertinggi (Gemini Ebook)'],
                ['9,749', 'Total views dalam 1 bulan'],
              ].map(([big, desc]) => (
                <div key={big} className="proof-num-card">
                  <div className="big">{big}</div>
                  <div className="desc">{desc}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 50, display: 'grid', gridTemplateColumns: '1fr', gap: 40, width: '100%', maxWidth: 760, marginLeft: 'auto', marginRight: 'auto' }}>
              <div className="mockup-window">
                <div className="mockup-header">
                  <span className="dot dot-r" /><span className="dot dot-y" /><span className="dot dot-g" />
                  <span className="mockup-address">belajarpakai.ai/bukti-omzet</span>
                </div>
                <img className="mockup-img" src="https://belajarpakai.ai/wp-content/uploads/2026/05/ChatGPT-Image-May-21-2026-01_25_00-PM-1.png" alt="Sales Chart Proof" loading="lazy" />
              </div>
              <div className="mockup-window">
                <div className="mockup-header">
                  <span className="dot dot-r" /><span className="dot dot-y" /><span className="dot dot-g" />
                  <span className="mockup-address">belajarpakai.ai/sales-ledger</span>
                </div>
                <img className="mockup-img" src="https://belajarpakai.ai/wp-content/uploads/2026/05/Screenshot-2026-05-21-110150.png" alt="Sales Ledger Proof" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* MATRIX */}
        <section className="matrix-section">
          <div className="container fade-up">
            <div className="center" style={{ marginBottom: 50 }}>
              <div className="tag"><i data-lucide="alert-triangle" style={{ width: 14, height: 14 }} /> Masalah &amp; Solusi</div>
              <h2>Masalah &amp; Solusi AI Creator</h2>
              <p className="matrix-lead">Udah Tahu AI Bisa Hasilkan Uang, Tapi Nggak Tahu Mulai Dari Mana? Berikut adalah perbandingan tantangan Anda dengan solusi taktis kami.</p>
            </div>
            <div className="matrix-grid">
              <div className="matrix-column the-old-way">
                <div className="matrix-col-header">
                  <i data-lucide="x-circle" /><h3>MASALAH YANG KAMU HADAPI</h3>
                </div>
                <ul className="matrix-list">
                  {[
                    ['Bingung produk apa yang bisa dijual', 'Terlalu banyak pilihan, tidak tahu mana yang paling potensial dan cepat laku di pasar.'],
                    ['Proses pembuatan konten butuh waktu lama', 'Nulis, desain, edit, upload — habis berjam-jam untuk 1 produk yang belum tentu laku.'],
                    ['Sudah coba, tapi konversi rendah', 'Views ada, tapi yang beli sedikit. Nggak tahu cara bikin landing page & iklan yang menjual.'],
                    ['Nggak tahu cara promosi yang efektif', 'Posting sudah, tapi sepi. Belum punya strategi konten viral dan sistem ads yang tepat.'],
                  ].map(([title, desc], i) => (
                    <li key={i}><div className="bullet-num">0{i + 1}</div><div><h4>{title}</h4><p>{desc}</p></div></li>
                  ))}
                </ul>
              </div>
              <div className="matrix-column the-new-way">
                <div className="matrix-col-header">
                  <i data-lucide="zap" /><h3>SOLUSI LENGKAP DI EBOOK INI</h3>
                </div>
                <ul className="matrix-list">
                  {[
                    ['Menemukan Ide Produk yang Laku', 'Framework riset produk yang terbukti. Cara melihat tren, validasi ide, dan memilih niche yang punya demand tinggi.'],
                    ['Workflow Buat Ebook 100% AI', 'Kombinasi ChatGPT + Canva AI untuk membuat ebook berkualitas premium dalam hitungan jam, bukan minggu.'],
                    ['Desain Premium dengan AI', 'Cara membuat cover menarik, visual konsisten, dan generate gambar profesional untuk meningkatkan nilai produk.'],
                    ['Sistem Penjualan & Monetisasi', 'Panduan lengkap membangun sistem digital yang menghasilkan uang — dari produk, platform, hingga strategi konversi.'],
                  ].map(([title, desc], i) => (
                    <li key={i}><div className="bullet-num">0{i + 1}</div><div><h4>{title}</h4><p>{desc}</p></div></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SYLLABUS */}
        <section className="syllabus-section" id="syllabus">
          <div className="container fade-up">
            <div className="center" style={{ marginBottom: 30 }}>
              <div className="tag"><i data-lucide="book-open" style={{ width: 14, height: 14 }} /> Isi Ebook</div>
              <h2>13 Bab Strategi Lengkap <span style={{ color: 'var(--gold)' }}>Siap Diterapkan</span></h2>
            </div>
            <div className="syllabus-grid">
              {[
                ['BAB 01', 'brain', 'Awal Mula Cuan dari AI', 'Kenapa AI jadi peluang besar, AI bukan pengganti manusia, cara orang biasa hasilkan uang'],
                ['BAB 02', 'file-text', 'Studi Kasus Hasil Nyata', 'Perjalanan membangun produk AI, hasil penjualan 1 bulan, breakdown produk yang cuan'],
                ['BAB 03', 'database', 'Framework Mesin Cuan AI', 'Cara kerja sistem bisnis modern, AI mempercepat semua proses, workflow harian'],
                ['BAB 04', 'search', 'Cara Menemukan Ide Produk Laku', 'Riset ide digital, teknik melihat produk viral, validasi & framework produk mudah dijual'],
                ['BAB 05', 'terminal', 'Workflow Buat Ebook 100% AI', 'Workflow saya, cara menggunakan ChatGPT untuk ide dan isi ebook'],
                ['BAB 06', 'palette', 'Cara Membuat Desain Premium', 'Cover menarik, visual konsisten, generate gambar AI, mengatasi limit'],
                ['BAB 07', 'code', 'Membuat Tools & Website dengan AI', 'Studi kasus AI Timelapse, Claude Code coding, deploy website, kenapa tools value-nya tinggi'],
                ['BAB 08', 'shopping-bag', 'Sistem Jual Produk Digital', 'Cara upload, pricing, thumbnail & deskripsi yang menjual, hingga sistem checkout otomatis'],
                ['BAB 09', 'megaphone', 'Framework Konten AI Viral', 'Membuat hook, konten carousel, script TikTok, workflow konten cepat'],
                ['BAB 10', 'target', 'Strategi FB Ads untuk Produk AI', 'Jalankan iklan pertama, scale ads profit, kesalahan pemula saat jalankan ads'],
                ['BAB 11', 'refresh-cw', 'Sistem Kerja AI Creator', 'Tools AI saya, mengatur banyak ide produk, produksi konten lebih cepat & konsisten'],
                ['BAB 12', 'copy', 'Template Prompt Siap Pakai', 'Prompt cari ide, buat ebook, desain, konten viral — langsung pakai!'],
                ['BAB 13', 'trending-up', 'Penutup & Masa Depan AI', 'AI ubah semua industri, peluang creator AI, skill wajib & langkah selanjutnya'],
              ].map(([badge, icon, title, desc]) => (
                <div key={badge} className="campus-card">
                  <div className="campus-header">
                    <div className="campus-badge">{badge}</div>
                    <i data-lucide={icon} />
                  </div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="hiw">
          <div className="container center fade-up">
            <div className="tag"><i data-lucide="refresh-cw" style={{ width: 14, height: 14 }} /> Framework</div>
            <h2>Mesin Cuan AI:<br /><span style={{ color: 'var(--gold)' }}>IDE → BUILD → CONTENT → ADS → SELL</span></h2>
          </div>
          <div className="container">
            <div className="steps fade-up">
              {[
                ['01', 'IDE', 'Temukan produk digital dengan potensi besar menggunakan riset AI berbasis data pasar'],
                ['02', 'BUILD', 'Bangun produk digital berkualitas tinggi dengan AI dalam waktu singkat'],
                ['03', 'CONTENT', 'Buat konten viral yang menarik audiens dan membangun kepercayaan'],
                ['04', 'ADS', 'Jalankan iklan yang tepat sasaran untuk menjangkau ribuan calon pembeli'],
                ['05', 'SELL', 'Ubah pengunjung menjadi pembeli dengan sistem otomatis 24 jam'],
              ].map(([num, title, desc]) => (
                <div key={num} className="step">
                  <div className="step-num">{num}</div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="testimonials">
          <div className="container fade-up">
            <div className="center" style={{ marginBottom: 10 }}>
              <div className="tag"><i data-lucide="star" style={{ width: 14, height: 14, fill: 'var(--gold)', stroke: 'var(--gold)' }} /> Kata Mereka</div>
              <h2>Pembeli Yang Sudah <span style={{ color: 'var(--gold)' }}>Merasakannya</span></h2>
            </div>
            <div className="testi-grid">
              {[
                ['"baguss penjelasannya oke nggak bertele tele. ternyata kalau di seriusin bisa jadi cuan juga yaa"', 'I', 'Irsyad', 'Web Developer'],
                ['"awalnya takut kalo Ai bakal gantiin kerjaan. eh taunya malah ngasilin uang ya. penjelasan di ebook nya juga ga ribet jadi gampang paham. mantappp."', 'FA', 'Fazri A.', 'Content Creator'],
                ['"Akhirnya ada panduan yang nggak cuma teori! Workflow ChatGPT + Canva AI-nya persis yang saya butuhkan. Recommended banget."', 'S', 'Surya', 'Desain Grafis & Editor'],
              ].map(([text, av, name, role]) => (
                <div key={name} className="testi-card">
                  <div className="stars">★★★★★</div>
                  <p className="testi-text">{text}</p>
                  <div className="testi-author">
                    <div className="avatar">{av}</div>
                    <div><div className="author-name">{name}</div><div className="author-role">{role}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="pricing" id="pricing">
          <div className="container center fade-up">
            <div className="tag"><i data-lucide="credit-card" style={{ width: 14, height: 14 }} /> Penawaran Terbatas</div>
            <h2 style={{ marginBottom: 40 }}>Mulai Perjalananmu <span style={{ color: 'var(--gold)' }}>Sekarang</span></h2>
            <div className="pricing-card">
              <div className="pricing-badge">
                <i data-lucide="flame" style={{ width: 12, height: 12, fill: 'currentColor' }} /> Paling Laris
              </div>
              <h3 style={{ fontSize: 22, marginTop: 24 }}>Profit Dari AI</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 }}>Akses penuh semua kursus & ebook</p>
              <div className="price-old">Rp 999.000</div>
              <div className="price-new"><small>Rp </small>199.000</div>
              <div className="price-note">Early Bird — Hanya untuk 100 member pertama!</div>
              <ul className="price-features">
                {[
                  'Akses penuh semua kursus AI',
                  'Semua ebook & template prompt eksklusif',
                  'Studi kasus nyata: dari nol ke Rp 74Jt',
                  'Framework konten viral + script TikTok',
                  'Panduan FB Ads untuk produk AI',
                  'Workflow buat ebook 100% AI',
                ].map(f => (
                  <li key={f}>
                    <span className="check"><i data-lucide="check" style={{ width: 16, height: 16 }} /></span> {f}
                  </li>
                ))}
              </ul>
              <a href="/checkout" className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 18, padding: '20px' }}>
                🚀 Dapatkan Akses Sekarang — Rp 199.000
              </a>
              <div className="guarantee">
                <span className="shield"><i data-lucide="shield-check" style={{ width: 24, height: 24 }} /></span>
                <div><strong style={{ color: 'var(--gold)' }}>Jaminan Kepuasan 100%</strong><br />Sekali bayar, akses selamanya. Harga naik setelah 100 member pertama. Bergabung sekarang dan kunci harga terbaik.</div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="faq">
          <div className="container fade-up">
            <div className="center" style={{ marginBottom: 10 }}>
              <div className="tag"><i data-lucide="help-circle" style={{ width: 14, height: 14 }} /> Pertanyaan Umum</div>
              <h2>Yang Sering Ditanyakan</h2>
            </div>
            <div className="faq-list">
              {[
                ['Apakah cocok untuk pemula yang belum tahu AI?', 'Ya, 100% cocok! Semua kursus dirancang dari nol, step-by-step, lengkap dengan praktik langsung. Tidak perlu background teknis atau pengalaman sebelumnya.'],
                ['Tools AI apa yang dibutuhkan?', 'Sebagian besar menggunakan ChatGPT, Claude, dan Canva AI — banyak yang tersedia gratis. Semua tools dijelaskan lengkap di dalam kursus beserta alternatif gratisnya.'],
                ['Berapa lama sampai bisa menghasilkan uang?', 'Bergantung konsistensi kamu. Dengan mengikuti framework di platform ini, pemula bisa mulai membuat produk pertama dalam beberapa hari dan mendapatkan penjualan dalam minggu pertama.'],
                ['Apa bedanya dengan YouTube atau konten gratis?', 'Platform ini menyajikan kurikulum terstruktur, studi kasus nyata, template siap pakai, dan framework terbukti — bukan sekadar teori. Hemat waktu berbulan-bulan trial and error sendiri.'],
                ['Setelah bayar, langsung bisa akses?', 'Ya! Setelah pembayaran terkonfirmasi otomatis, akun kamu langsung aktif dan bisa mengakses semua kursus & ebook. Tidak perlu menunggu konfirmasi manual.'],
                ['Apakah harga bisa naik?', 'Ya. Harga Rp 199.000 adalah harga early bird untuk 100 member pertama. Setelah kuota penuh, harga akan naik. Daftar sekarang untuk kunci harga terbaik.'],
              ].map(([q, a]) => (
                <div key={q} className="faq-item">
                  <div className="faq-q">{q}</div>
                  <div className="faq-a">{a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <div className="final-cta">
          <div className="urgency-bar">
            <i data-lucide="clock" style={{ width: 14, height: 14, verticalAlign: 'middle', marginRight: 4 }} /> Early Bird — Hanya untuk 100 member pertama. Harga naik setelahnya.
          </div>
          <h2>Siap Ubah Ilmu AI<br />Jadi <span style={{ color: 'var(--gold-light)' }}>Cuan Nyata?</span></h2>
          <p>Satu keputusan hari ini bisa mengubah segalanya. Bergabunglah dengan creator yang sudah membuktikan bahwa AI bisa menghasilkan pendapatan nyata — bukan sekadar wacana.</p>
          <a href="/checkout" className="btn-primary" style={{ fontSize: 18, padding: '20px 44px' }}>
            🚀 Mulai Sekarang — Rp 199.000
          </a>
          <p style={{ fontSize: 13, color: 'var(--gold-light)', marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i data-lucide="check-circle" style={{ width: 14, height: 14 }} /> Akses langsung setelah bayar</span>
            <span>·</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i data-lucide="check-circle" style={{ width: 14, height: 14 }} /> Sekali bayar — tanpa biaya bulanan</span>
            <span>·</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i data-lucide="check-circle" style={{ width: 14, height: 14 }} /> Konten terus diupdate</span>
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 12, fontStyle: 'italic', textTransform: 'none' }}>
            &quot;Masa depan bukan milik yang paling pintar, tapi milik yang paling cepat beradaptasi dan bertindak.&quot;
          </p>
        </div>

        {/* FOOTER */}
        <footer>
          <div>© 2026 Profit dari AI — Hak cipta dilindungi undang-undang.</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="/login" style={{ color: 'inherit' }}>Masuk</a>
            <a href="/checkout" style={{ color: 'inherit' }}>Daftar</a>
          </div>
        </footer>
      </div>
    </>
  )
}
