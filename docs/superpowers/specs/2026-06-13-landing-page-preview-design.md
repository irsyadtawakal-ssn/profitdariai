# Landing Page Preview — Design Spec

**Tanggal:** 2026-06-13
**Status:** Approved (brainstorming)

## Tujuan

Memberi admin kemampuan preview HTML landing page sebelum disimpan. Preview menampilkan HTML 100% utuh di halaman terpisah, memungkinkan admin iterate cepat (edit HTML → preview → edit → preview).

## Non-Goals

- Real-time preview (klik tombol dulu)
- Preview untuk published pages di list (hanya untuk unsaved draft dalam dialog)
- Size limit, timeout, atau sanitasi HTML (admin trusted, HTML mentah sengaja diizinkan)

## Arsitektur

### 1. Route Handler — `/admin/landing/preview/route.ts`

Endpoint baru (GET) yang:
- **Require admin** — `requireAdmin()` sebaris pertama (403 jika bukan admin)
- **Param:** query string `?html=<base64-encoded-html>`
- **Logika:**
  1. Validasi: param `html` wajib ada, jika tidak → return 400
  2. Decode base64 → string HTML
  3. Return `new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })`
- **Output:** Raw HTML, tidak dibungkus React atau layout admin

Catatan: Route ini tidak pakai database, hanya process query param. URL length limit ~2000-8000 char tergantung browser (base64 encode ~1.33x size asli, jadi HTML ~1500-6000 byte OK).

### 2. Dialog — Tombol Preview

Modifikasi `src/app/(admin)/admin/landing/LandingDialog.tsx`:
- Tambah tombol "Preview" di footer form (sebelum tombol "Simpan")
- OnClick handler:
  1. Encode state `html` ke base64: `btoa(html)`
  2. Buka tab baru: `window.open('/admin/landing/preview?html=' + encodeURIComponent(base64), '_blank')`
  3. Form tetap isi (user bisa edit & preview lagi)
- Tombol disable jika `html` kosong atau `isPending` (sama seperti tombol Simpan)

## Workflow Admin

1. Admin `/admin/landing` → "+ Tambah" → dialog buka
2. Paste HTML ke textarea
3. Klik **Preview** → tab baru render HTML (persis seperti akan keluar di `/lp/{slug}`)
4. Lihat preview, close tab, kembali ke form
5. Edit HTML di textarea → klik Preview lagi (iterate)
6. Puas → klik **Simpan** → landed

## Testing

- Route `/admin/landing/preview` tanpa param `html` → 400
- Route tanpa auth (non-admin) → 403 (requireAdmin)
- Route dengan `?html=BASE64` (valid, admin) → 200, content-type `text/html`
- HTML di preview identik source (tanpa modifikasi)
- Dialog: tombol Preview disable saat HTML kosong
- Dialog: tombol Preview open tab baru, form tetap isi

## Size Consideration

Base64 encoding: 1.33x size asli. Browser URL limit ~2000-8000 char.
- HTML 1500 byte → base64 2000 char → safe
- HTML 4500 byte → base64 6000 char → borderline
- HTML 6000+ byte → risk 414 (URI too long)

Handling: Jika admin paste HTML > ~4000 byte, tombol Preview tetap jalan tapi mungkin error 414. Acceptable (rare case, user bisa shortcut HTML buat preview, atau gunakan dev server lokal).

## Notes

- Preview tidak pakai state/session (stateless)
- Preview tidak pakai database (HTML dari URL param)
- Preview route tidak ada RLS (hanya requireAdmin)
- base64 encoding safe untuk HTML dengan Unicode (btoa + encodeURIComponent handle)
