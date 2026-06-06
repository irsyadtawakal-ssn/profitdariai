# Aureum Cyber - Stitch Design System Specification

Design System ini mewujudkan estetika **"Premium Neo-Cyberpunk"**, menggabungkan ketajaman futurisme teknologi tinggi dengan keanggunan kemewahan finansial. Ini dirancang untuk individu bernilai bersih tinggi dan investor mahir teknologi yang menavigasi persimpangan antara Kecerdasan Buatan dan pembentukan kekayaan.

---

## Token & Konfigurasi Desain

### 1. Warna Sistem (Colors)

| Token Nama | Nilai Hex / RGBA | Keterangan |
| :--- | :--- | :--- |
| **Obsidian Black** | `#0A0A0A` | Dasar latar belakang utama dan panel gelap. |
| **Ivory** | `#F5F5F0` | Warna teks primer, alternatif dari putih murni agar lebih nyaman dibaca. |
| **Gold** | `#D4AF37` | Aksen warna emas untuk tautan aktif, border tipis, dan data penting. |
| **Neon Gold Glow** | `rgba(212, 175, 55, 0.2)` | Warna semi-transparan untuk bayangan pendar (*box-shadow/glow*). |
| **Glass Background** | `rgba(14, 14, 14, 0.8)` | Lapisan kaca gelap dengan filter pemburaman latar (`backdrop-filter: blur(20px)`). |
| **Outline Variant** | `#4D4635` | Warna abu-emas redup untuk border non-aktif. |

### 2. Tipografi (Typography)

Sistem menggunakan kombinasi tiga jenis font untuk menyeimbangkan presisi teknis dengan kemewahan:

1. **Sora (Headlines)**:
   - Font sans-serif geometris dengan nuansa futuristik.
   - Digunakan untuk judul besar (`h1`, `h2`) dan pernyataan penting.
2. **Hanken Grotesk (Body)**:
   - Font sans-serif kontemporer dengan tingkat keterbacaan yang sangat tinggi.
   - Digunakan untuk deskripsi panjang dan isi konten utama.
3. **JetBrains Mono (Labels/Data/Mono)**:
   - Font monospaced untuk label kecil, indikator, angka finansial, dan visual status AI.

| Skala Tipografi | Font Family | Font Size | Font Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-lg` | Sora | `48px` | `800` | `1.1` | `-0.02em` |
| `display-lg-mobile` | Sora | `32px` | `800` | `1.2` | Normal |
| `headline-md` | Sora | `24px` | `600` | `1.4` | Normal |
| `body-lg` | Hanken Grotesk | `18px` | `400` | `1.6` | Normal |
| `body-md` | Hanken Grotesk | `16px` | `400` | `1.6` | Normal |
| `label-caps` | JetBrains Mono | `12px` | `500` | `1.0` | `0.15em` |
| `data-mono` | JetBrains Mono | `14px` | `400` | `1.4` | Normal |

### 3. Jarak & Grid (Spacing)

- **Grid Latar Belakang (Visible Grid)**: Latar belakang memiliki pola garis kotak (grid) berpendar tipis berukuran **32px x 32px**.
- **Container Max-Width**: `1280px`
- **Gutter (Sela Kolom)**: `24px` (Desktop), `16px` (Mobile)
- **Unit Spacing**: Semua margin dan padding menggunakan kelipatan **8px**.

---

## Aturan Struktur Visual

### 1. Cybernetic Corners (Sudut Kaca Cyber)
Sebuah panel glassmorphism harus menggunakan efek potongan sudut beveled 45 derajat (notched corner) dengan clip-path CSS:
```css
.cyber-corner {
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%);
}
```

### 2. Panel Kaca Terlaminasi (Glass Elevation)
- **Dasar (Level 0)**: Obsidian Black murni (`#0A0A0A`) dengan overlay grid 32px (`opacity: 0.03`).
- **Card (Level 1)**: Transparansi `75% - 80%` dengan backdrop-filter blur `20px` dan garis border emas tipis `rgba(212, 175, 55, 0.15)`.
- **Hover/Aktif (Level 2)**: Garis border emas naik ke pendaran `80%` dengan bayangan berpendar emas (`box-shadow: 0 0 20px rgba(212, 175, 55, 0.15)`).

### 3. Aturan Bentuk Tajam (Sharp Shapes)
- **Ketentuan Utama**: Radius border `0px` (`rounded-none`) pada semua tombol, input form, badge, dan kartu.
- **Pengecualian**: Hanya diizinkan melingkar (`rounded-full`) pada item status pill status sinyal/indikator aktif.
