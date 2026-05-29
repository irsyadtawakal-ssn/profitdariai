# Panduan Migrasi: Vercel → VPS

> **Status:** ✅ **MIGRASI SELESAI (29 May 2026)**
> - VPS: Biznet GIO NEO Lite SS 2.2 (2 vCPU, 2GB RAM, 60GB SSD) @ IP `103.93.163.183`
> - App: Live di `http://103.93.163.183` via Nginx + PM2 ✅
> - Env Vars: `.env.local` loaded ✅
> - GitHub Actions: Secrets configured ✅
> - Tripay IP Whitelist: Updated ✅
> - DNS: Pending propagation (TTL 300, ~1 jam)
> - SSL: Pending DNS propagation → Certbot
> 
> **Next:** Tunggu DNS propagate (~30-60 min), lalu setup SSL dengan Certbot.

---

## Panduan Referensi (Sudah Dijalankan)

> **Kapan dilakukan:** Setelah MVP stabil dan ada revenue. Lakukan di luar jam ramai (malam).  
> **Estimasi downtime:** 0–5 menit (jika pakai strategi blue-green DNS).  
> **Prasyarat:** Sudah punya subscriber aktif di Vercel, lalu migrasi ke VPS.

---

## Mengapa Migrasi ke VPS?

| Alasan | Detail |
|---|---|
| **Static IP** | VPS punya IP tetap → bisa whitelist di Tripay tanpa workaround |
| **Biaya** | VPS Hostinger ~Rp 30–80rb/bulan vs Vercel Pro $20/bulan untuk static IP |
| **Kontrol penuh** | Bisa setup cron, custom config, tidak tergantung platform |
| **Webhook Tripay** | IP dinamis Vercel menjadi masalah produksi — VPS menyelesaikan ini permanen |

---

## Spesifikasi VPS yang Dibutuhkan

| Resource | Minimum | Rekomendasi |
|---|---|---|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 1 GB | 2 GB |
| Storage | 20 GB SSD | 40 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Bandwidth | 1 TB/bulan | 2 TB/bulan |

**Hostinger plan yang cocok:** KVM 1 atau KVM 2 (cek promo, biasanya Rp 30–60rb/bulan).

---

## Database — Tidak Perlu Dimigrasikan

> **TL;DR:** Supabase tetap di tempatnya. Kamu hanya pindahkan Next.js server dari Vercel ke VPS.

```
SEBELUM (Vercel)          SESUDAH (VPS)
─────────────────         ─────────────────
Vercel (Next.js)    →     VPS (Next.js + PM2)
     ↓                          ↓
Supabase (DB)       →     Supabase (DB)  ← TIDAK BERUBAH
     ↓                          ↓
Tripay (Payment)    →     Tripay (Payment) ← TIDAK BERUBAH
```

Supabase adalah **managed PostgreSQL** yang independent — tidak terikat ke Vercel maupun VPS. Env vars Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, dll.) cukup di-copy ke `.env.production` di VPS, selesai.

### Yang Tidak Berubah

| Komponen | Status |
|---|---|
| Supabase project URL | ✅ Sama persis |
| Database schema & data | ✅ Tidak tersentuh |
| RLS policies | ✅ Tidak tersentuh |
| Auth (Supabase Auth) | ✅ Sama — session tetap valid |
| Storage (signed URLs) | ✅ Sama |
| Realtime subscriptions | ✅ Sama |

### Yang Perlu Dicek

**Supabase Auth Redirect URLs** — setelah DNS pindah, pastikan domain sudah terdaftar:

1. Buka [supabase.com/dashboard](https://supabase.com/dashboard) → project kamu
2. **Authentication → URL Configuration**
3. Pastikan ada:
   ```
   Site URL:          https://profitdariai.com
   Redirect URLs:     https://profitdariai.com/api/auth/callback
                      https://profitdariai.com/dashboard
   ```
4. Kalau belum ada → tambahkan sebelum DNS dipindah

**Supabase connection pooling** — default Supabase pakai port 5432 (direct) atau 6543 (pooler via pgBouncer). Untuk produksi dengan traffic, pertimbangkan ganti ke Transaction Pooler:

```
# .env.production
# Ganti dari direct connection ke pooler jika mulai dapat banyak concurrent user
# Supabase dashboard → Settings → Database → Connection Pooling
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co   # tidak berubah
```

Untuk skala sekarang (awal launch), direct connection sudah cukup.

### Kapan Pertimbangkan Self-Host PostgreSQL di VPS?

> Ini **Phase 3+**, jauh ke depan, tidak perlu sekarang.

Baru perlu kalau:
- Biaya Supabase > Rp 500rb/bulan (plan Pro $25)
- Butuh query custom yang tidak bisa di Supabase
- Compliance data harus di Indonesia

Jika sampai di titik itu, prosesnya: install PostgreSQL di VPS → `pg_dump` dari Supabase → `pg_restore` ke VPS → update connection string. Tapi ini membawa tanggung jawab backup, upgrade, HA — tidak trivial.

---

## Fase 1 — Persiapan Sebelum Migrasi

### 1.1 Update `next.config.ts` untuk standalone output

```ts
// next.config.ts
const nextConfig: NextConfig = {
  output: 'standalone',   // ← tambahkan ini
  images: {
    remotePatterns: [...], // sudah ada
  },
}
```

Commit dan push ke GitHub sebelum mulai migrasi VPS.

### 1.2 Siapkan secrets GitHub Actions

Di GitHub repo → **Settings → Secrets and variables → Actions**, tambahkan:

| Secret | Value |
|---|---|
| `VPS_HOST` | IP address VPS kamu |
| `VPS_USER` | `root` atau user SSH kamu |
| `VPS_SSH_KEY` | Private key SSH (lihat langkah 2.3) |
| `VPS_PORT` | `22` (default SSH) |

### 1.3 Catat semua env vars production saat ini

Buka Vercel dashboard → Settings → Environment Variables, salin semua ke file sementara (jangan commit):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TRIPAY_API_KEY=
TRIPAY_PRIVATE_KEY=
TRIPAY_MERCHANT_CODE=
TRIPAY_MODE=production
TRIPAY_CALLBACK_URL=https://profitdariai.com/api/payment/webhook
TRIPAY_RETURN_URL=https://profitdariai.com/dashboard?payment=success
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=admin@profitdariai.com
SMTP_PASS=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=https://profitdariai.com
```

---

## Fase 2 — Setup VPS

### 2.1 Login ke VPS & update sistem

```bash
ssh root@<IP_VPS>
apt update && apt upgrade -y
apt install -y git curl wget unzip ufw fail2ban
```

### 2.2 Hardening dasar

```bash
# Firewall
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable

# Fail2ban (blokir brute force SSH)
systemctl enable fail2ban
systemctl start fail2ban
```

### 2.3 Buat SSH key untuk GitHub Actions

```bash
# Di VPS
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""

# Tambahkan public key ke authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Tampilkan private key — copy ini ke GitHub Secret VPS_SSH_KEY
cat ~/.ssh/github_actions
```

### 2.4 Install Node.js via nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v   # pastikan v20.x
```

### 2.5 Install pnpm & PM2

```bash
npm install -g pnpm pm2
pm2 startup   # copy-paste perintah yang muncul, jalankan
```

### 2.6 Install Nginx

```bash
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

---

## Fase 3 — Deploy Manual Pertama

### 3.1 Clone repo di VPS

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/<username>/profitdariai.git
cd profitdariai
```

### 3.2 Setup env vars di VPS

```bash
nano /var/www/profitdariai/.env.production
# Paste semua env vars dari langkah 1.3
# Simpan dengan Ctrl+X → Y → Enter
```

### 3.3 Build aplikasi

```bash
cd /var/www/profitdariai
pnpm install --frozen-lockfile
pnpm build
```

Build akan menghasilkan `.next/standalone/` karena sudah set `output: 'standalone'`.

### 3.4 Setup PM2

Buat file `ecosystem.config.js` di root project:

```js
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'profitdariai',
      script: '.next/standalone/server.js',
      cwd: '/var/www/profitdariai',
      env_file: '/var/www/profitdariai/.env.production',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
}
```

```bash
# Salin static files yang dibutuhkan standalone
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# Start dengan PM2
pm2 start ecosystem.config.js
pm2 save   # simpan agar restart otomatis setelah reboot
```

Verifikasi: `pm2 status` → harus `online`.

---

## Fase 4 — Nginx Reverse Proxy + SSL

### 4.1 Konfigurasi Nginx

```bash
nano /etc/nginx/sites-available/profitdariai
```

```nginx
server {
    listen 80;
    server_name profitdariai.com www.profitdariai.com;

    # Redirect www ke non-www
    if ($host = www.profitdariai.com) {
        return 301 https://profitdariai.com$request_uri;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # Upload size limit (untuk future file uploads)
    client_max_body_size 10M;
}
```

```bash
ln -s /etc/nginx/sites-available/profitdariai /etc/nginx/sites-enabled/
nginx -t   # test config — harus "ok"
systemctl reload nginx
```

### 4.2 Install SSL dengan Certbot

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d profitdariai.com -d www.profitdariai.com
# Ikuti prompt, masukkan email, pilih redirect HTTP → HTTPS
```

Certbot otomatis update Nginx config dan setup auto-renewal. Verifikasi:

```bash
certbot renew --dry-run   # pastikan renewal berjalan
```

---

## Fase 5 — GitHub Actions CI/CD

Buat file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT }}
          script: |
            set -e
            cd /var/www/profitdariai
            git pull origin main
            pnpm install --frozen-lockfile
            pnpm build
            cp -r .next/static .next/standalone/.next/static
            cp -r public .next/standalone/public
            pm2 reload profitdariai --update-env
            echo "Deploy selesai: $(date)"
```

Commit dan push. Setiap push ke `main` akan auto-deploy ke VPS.

---

## Fase 6 — Cron Job (Ganti Vercel Cron)

Vercel Cron (`vercel.json`) tidak berjalan di VPS. Ganti dengan system cron:

```bash
crontab -e
```

Tambahkan:

```cron
# Renewal reminder — setiap hari jam 09:00 WIB (02:00 UTC)
0 2 * * * curl -s -X GET "https://profitdariai.com/api/cron/renewal-reminder" \
  -H "Authorization: Bearer <CRON_SECRET>" \
  >> /var/log/profitdariai-cron.log 2>&1
```

Ganti `<CRON_SECRET>` dengan nilai `CRON_SECRET` dari env vars.

---

## Fase 7 — Update Tripay Whitelist IP

Ini adalah salah satu alasan utama migrasi. Dengan VPS:

1. Dapatkan IP statis VPS kamu: `curl ifconfig.me`
2. Login ke dashboard Tripay merchant
3. **Settings → Callback/Webhook → Whitelist IP** → tambahkan IP VPS
4. Update `TRIPAY_CALLBACK_URL` di `.env.production`:
   ```
   TRIPAY_CALLBACK_URL=https://profitdariai.com/api/payment/webhook
   ```
   *(URL sama, tapi sekarang VPS IP sudah diwhitelist)*

---

## Fase 8 — Migrasi DNS

> ⚠️ **Lakukan ini terakhir** setelah semua berjalan di VPS dan sudah ditest.

### 8.1 Test VPS langsung via IP dulu

Tambahkan ke `/etc/hosts` lokal kamu (laptop):

```
<IP_VPS>  profitdariai.com
```

Buka browser → `https://profitdariai.com` → pastikan semua berjalan.

Hapus entry `/etc/hosts` setelah selesai test.

### 8.2 Pindahkan DNS

Di domain registrar (Niagahoster/Namecheap/dll):

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | `<IP_VPS>` | 300 |
| A | `www` | `<IP_VPS>` | 300 |

> Set TTL ke 300 (5 menit) dulu agar propagasi cepat dan mudah rollback.

### 8.3 Tunggu propagasi

```bash
# Cek dari terminal (ganti ke IP VPS ketika propagasi selesai)
watch -n 10 "dig profitdariai.com +short"
```

Propagasi biasanya 5–30 menit (tergantung TTL lama).

---

## Fase 9 — Smoke Test Checklist

Jalankan semua ini setelah DNS propagasi selesai:

```
LANDING & AUTH
[ ] https://profitdariai.com → landing page load
[ ] https://profitdariai.com/login → halaman login
[ ] https://profitdariai.com/signup → registrasi baru
[ ] https://profitdariai.com/ketentuan-layanan → legal pages
[ ] Redirect HTTP → HTTPS otomatis (coba http://profitdariai.com)

MEMBER AREA
[ ] Login → redirect ke /dashboard
[ ] /dashboard → data kursus & ebook muncul
[ ] /kursus → grid kursus tampil
[ ] /ebook → grid ebook tampil
[ ] /ebook/{slug} → download button berfungsi
[ ] /profile → info member benar
[ ] Expired membership → redirect ke /pricing

ADMIN
[ ] /admin → redirect ke /admin/dashboard (kalau admin)
[ ] /admin/kursus → list kursus tampil
[ ] Tambah kursus baru → tersimpan
[ ] Tambah ebook baru → tersimpan
[ ] Non-admin akses /admin → redirect ke /dashboard

PAYMENT
[ ] /checkout → form muncul, bisa pilih metode
[ ] Test transaction (pakai sandbox Tripay) → redirect ke Tripay
[ ] Webhook callback masuk → cek log PM2: `pm2 logs profitdariai`

API
[ ] GET /api/auth/callback → tidak error (redirect ke login)
[ ] GET /api/cron/renewal-reminder (dengan Authorization header) → 200
[ ] POST /api/ebook/download/{id} tanpa auth → 401

PERFORMA
[ ] Navigasi antar tab member area → skeleton muncul, cepat
[ ] Google PageSpeed Insights → score ≥ 80 mobile
```

---

## Fase 10 — Cleanup Vercel

Setelah DNS propagasi dan smoke test lulus:

1. **Jangan langsung hapus Vercel** — tunggu 1–2 minggu untuk monitoring
2. Set TTL DNS ke 3600 (1 jam) setelah stabil
3. Hapus Vercel project setelah yakin tidak ada masalah
4. Update `vercel.json` → bisa dihapus dari repo (cron sudah pindah ke system cron)

---

## Troubleshooting

### App tidak start / PM2 error

```bash
pm2 logs profitdariai --lines 50   # cek error log
pm2 restart profitdariai
```

### Nginx 502 Bad Gateway

```bash
systemctl status nginx
pm2 status   # pastikan app online di port 3000
curl http://localhost:3000   # test langsung tanpa Nginx
```

### SSL certificate error

```bash
certbot renew --force-renewal
systemctl reload nginx
```

### Build gagal di VPS (out of memory)

```bash
# Tambahkan swap jika RAM < 2GB
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

Lalu jalankan build ulang.

### Webhook Tripay tidak masuk

```bash
# Cek PM2 log saat test payment
pm2 logs profitdariai --lines 100

# Pastikan IP VPS sudah diwhitelist di Tripay
curl ifconfig.me   # ini IP yang harus diwhitelist
```

---

## Rollback Plan

Jika ada masalah serius setelah DNS pindah:

1. **Kembalikan DNS** ke Vercel IP (cek di Vercel → Settings → Domains → lihat IP lama)
2. DNS propagasi ~5 menit (karena TTL 300)
3. Vercel masih running selama belum dihapus → traffic langsung kembali normal
4. Debug masalah di VPS tanpa pressure downtime

---

## Monitoring Setelah Migrasi

```bash
# Cek status app
pm2 status
pm2 monit   # real-time monitoring

# Cek log
pm2 logs profitdariai
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Cek disk & memory
df -h
free -h
```

Setup PM2 log rotation agar tidak memenuhi disk:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## ✅ MIGRASI COMPLETION LOG (29 May 2026)

### VPS & Infrastructure
- ✅ **VPS Ordered:** Biznet GIO NEO Lite SS 2.2 (2 vCPU, 2GB RAM, 60GB SSD)
- ✅ **IP Static:** `103.93.163.183`
- ✅ **OS:** Ubuntu 22.04 LTS
- ✅ **SSH Key:** ED25519 key generated & imported
- ✅ **Firewall:** UFW configured (80, 443, 22 allowed)

### Software Stack
- ✅ **Node.js:** v20.20.2 via nvm
- ✅ **pnpm:** Global installed
- ✅ **PM2:** Installed, startup configured
- ✅ **Nginx:** Configured as reverse proxy (localhost:3000)
- ✅ **Certbot:** Installed, pending DNS propagation

### Application Deployment
- ✅ **Code:** Repository cloned from GitHub
- ✅ **Dependencies:** `pnpm install --frozen-lockfile` ✓
- ✅ **Build:** `pnpm build` ✓ (standalone output)
- ✅ **PM2:** Started via `ecosystem.config.js`
- ✅ **Env Vars:** `.env.local` loaded in `.next/standalone/`
- ✅ **Static Files:** Copied to `.next/standalone/`

### Integration & Security
- ✅ **GitHub Actions:** VPS secrets configured (VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_PORT)
- ✅ **Tripay Webhook:** IP whitelist updated (103.93.163.183)
- ✅ **Auto-Deploy:** GitHub workflow ready (push → auto deploy via SSH)

### Status & Testing
- ✅ **Landing Page:** Live via `http://103.93.163.183`
- ✅ **Checkout Page:** Live via `http://103.93.163.183/checkout`
- ✅ **Nginx Proxy:** Working correctly (PM2 app ← → Nginx)
- ✅ **SSL:** Pending (waiting for DNS propagation)
- ⏳ **DNS:** Propagating (~30-60 min estimated)

### Outstanding Tasks
- ⏳ **DNS Propagation:** Monitor with `dig profitdariai.com +short`
- ⏳ **SSL Setup:** Run Certbot after DNS is live
- ⏳ **Smoke Test:** Full feature test via domain (when DNS ready)
- ⏳ **Vercel Cleanup:** Keep Vercel for 1-2 weeks, then delete

### Quick Commands (VPS)
```bash
# SSH into VPS
ssh -i ~/.ssh/id_ed25519 profitdariai@103.93.163.183

# Check app status
pm2 status
pm2 logs profitdariai

# Restart app
pm2 restart profitdariai

# View env vars
cat /var/www/profitdariai/.env.local

# Check Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### DNS & SSL (Next Steps)
```bash
# Check DNS propagation (run every 10 min)
dig profitdariai.com +short

# Once DNS is live, setup SSL
sudo certbot --nginx -d profitdariai.com -d www.profitdariai.com

# Check SSL auto-renewal
certbot renew --dry-run
```
