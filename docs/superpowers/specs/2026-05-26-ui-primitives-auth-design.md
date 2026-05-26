# Design Spec: UI Primitives + Auth Pages
**Date:** 2026-05-26  
**Project:** profitdariai  
**Status:** Approved  

---

## 1. Scope

Build UI primitives dan auth pages sebagai fondasi visual profitdariai sebelum landing page dan member dashboard.

**In scope:**
- Shadcn/ui setup + brand theming
- UI Primitives: Button, Card, Input, Label, Badge, Dialog (Modal)
- Auth pages: Login, Signup, Reset Password
- Auth forms: react-hook-form + zod validation
- Supabase Auth integration (email + password)

**Out of scope:**
- Google OAuth (catatan: siapkan slot UI, implement di Phase 2)
- Social login lainnya
- Landing page
- Member dashboard

---

## 2. Architecture

### 2.1 Component Library: Shadcn/ui + Custom Theme

**Pendekatan:** Opsi 3 — Shadcn install dengan CSS variables override.

Install shadcn dengan `--style default`. Override CSS variables di `globals.css` agar map ke brand palette profitdariai. Buat thin wrapper di `src/components/ui/` yang sudah pre-styled — komponen siap pakai tanpa perlu ulang className di tiap usage.

### 2.2 Folder Structure

```
src/components/
├── ui/                    # Shadcn primitives (re-exported, branded)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── badge.tsx
│   └── dialog.tsx
├── auth/
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   └── ResetPasswordForm.tsx
└── shared/
    └── Logo.tsx
```

### 2.3 Theme CSS Variables

Ditambahkan ke `src/app/globals.css`:

```css
--primary: #D4AF37;           /* gold — button primary, active state */
--primary-foreground: #0A0A0A;
--background: #0A0A0A;        /* obsidian */
--foreground: #F5F5F0;        /* ivory */
--card: #1A1A1A;              /* charcoal */
--card-foreground: #F5F5F0;
--border: #2A2A2A;            /* smoke gray */
--input: #0A0A0A;
--ring: rgba(212, 175, 55, 0.3); /* gold glow focus */
--muted: #1A1A1A;
--muted-foreground: #888888;
--destructive: #EF4444;
--success: #22C55E;
--warning: #F59E0B;
```

---

## 3. UI Primitives

### 3.1 Button

**Variants:**

| Variant | Style |
|---|---|
| `primary` (default) | bg `#D4AF37`, text `#0A0A0A`, font-weight 600. Hover: bg `#A88A2B` + `box-shadow: 0 0 32px rgba(212,175,55,0.3)` + `translateY(-1px)` |
| `secondary` | bg transparent, border `#2A2A2A`, text ivory. Hover: border gold, text gold |
| `ghost` | no border, text `#888`. Hover: text ivory |

**Sizes:**

| Size | Height | Padding | Font |
|---|---|---|---|
| `sm` | 32px | `8px 16px` | 14px |
| `md` (default) | 44px | `12px 24px` | 16px |
| `lg` | 52px | `14px 28px` | 16px |

**States:** `loading` (spinner replace text, disabled pointer), `disabled` (opacity 50%)

**Transition:** `all 200ms cubic-bezier(0.16, 1, 0.3, 1)`

### 3.2 Card

**Variants:**

| Variant | Style |
|---|---|
| `default` | bg `#1A1A1A`, border `1px solid #2A2A2A`, radius `12px`, padding `24px` |
| `interactive` | default + hover: `border-color: #D4AF37`, `box-shadow: 0 0 24px rgba(212,175,55,0.1)` — untuk card kursus/ebook |

Sub-components: `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`.

### 3.3 Input + Label

**Input states:**

| State | Style |
|---|---|
| Default | bg `#0A0A0A`, border `#2A2A2A`, text ivory, radius `8px`, padding `12px 16px` |
| Focus | border `#D4AF37`, ring `0 0 0 3px rgba(212,175,55,0.1)` |
| Error | border `#EF4444`, ring `0 0 0 3px rgba(239,68,68,0.1)` |
| Disabled | opacity 50%, cursor not-allowed |

**Label:** text `14px`, font-weight 500, color ivory, `mb-1.5`. Error state: color `#EF4444`.

Selalu digunakan berpasangan: `<Label>` di atas, `<Input>`, optional `<p>` error di bawah.

### 3.4 Badge

| Variant | Style | Use case |
|---|---|---|
| `gold` | bg `rgba(212,175,55,0.15)`, text gold, border `rgba(212,175,55,0.3)` | "Member Aktif" |
| `muted` | bg `#1A1A1A`, text `#888`, border `#2A2A2A` | "Expired", status netral |
| `success` | bg `rgba(34,197,94,0.15)`, text `#22C55E` | "Lunas", "Terverifikasi" |
| `warning` | bg `rgba(245,158,11,0.15)`, text `#F59E0B` | "Segera Expire" |
| `destructive` | bg `rgba(239,68,68,0.15)`, text `#EF4444` | "Gagal", "Ditolak" |

### 3.5 Dialog (Modal)

- **Overlay:** bg `rgba(0,0,0,0.8)`, `backdrop-blur-sm`
- **Content:** bg `#1A1A1A`, border `#2A2A2A`, radius `16px`, max-w `500px`
- **Header:** judul ivory bold, close button ghost top-right
- **Footer:** flex row, gap 8px, right-aligned

---

## 4. Auth Pages

### 4.1 Shared Layout

Semua auth pages menggunakan `src/app/(auth)/layout.tsx`:
- Full screen bg `#0A0A0A`
- Subtle radial gold glow center (opacity 5%) via CSS background
- Card center screen: max-w `400px`, bg `#1A1A1A`, border `#2A2A2A`, radius `16px`, padding `32px`
- Logo `profitdariai` (gold, bold) di atas card, `mb-8`, centered

### 4.2 Login Page — `/login`

**Fields:**
- Email (type email, autocomplete email)
- Password (type password, show/hide toggle — eye icon Lucide)

**Layout:**
```
Logo
Heading: "Masuk ke akunmu" (h2, ivory)
Sub: "Akses kursus & ebook eksklusif kamu" (body-sm, muted)
─────────────────────────
Label + Input Email
Label + Input Password [show/hide]
Link kanan: "Lupa password?" → /reset-password
─────────────────────────
Button primary full-width: "Masuk"
[SLOT] Button Google OAuth (hidden, Phase 2)
─────────────────────────
Text center: "Belum punya akun?"
Link: "Daftar sekarang" → /signup
```

**Zod schema:**
```ts
loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})
```

**Behavior:**
- Submit → `supabase.auth.signInWithPassword()`
- Success → redirect `/dashboard`
- Error server (invalid credentials) → `toast.error('Email atau password salah')`
- Error field → inline di bawah input

### 4.3 Signup Page — `/signup`

**Fields:**
- Nama lengkap
- Email
- Password (min 8 karakter, helper text)
- Konfirmasi password

**Layout:**
```
Logo
Heading: "Buat akun baru"
Sub: "Bergabung dan mulai belajar cuan dari AI"
─────────────────────────
Label + Input Nama Lengkap
Label + Input Email
Label + Input Password + helper "Minimal 8 karakter"
Label + Input Konfirmasi Password
─────────────────────────
Button primary full-width: "Buat Akun"
[SLOT] Button Google OAuth (hidden, Phase 2)
─────────────────────────
Text center: "Sudah punya akun?"
Link: "Masuk" → /login
```

**Zod schema:**
```ts
signupSchema = z.object({
  full_name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: 'Password tidak cocok',
  path: ['confirm_password'],
})
```

**Behavior:**
- Submit → `supabase.auth.signUp()` dengan `data: { full_name }`
- Success → `toast.success('Cek email kamu untuk verifikasi!')` + redirect `/login`
- Error (email sudah terdaftar) → `toast.error('Email sudah terdaftar')`

### 4.4 Reset Password Page — `/reset-password`

**Fields:** Email saja

**Layout:**
```
Logo
Heading: "Reset password"
Sub: "Masukkan emailmu, kami kirim link reset."
─────────────────────────
Label + Input Email
─────────────────────────
Button primary full-width: "Kirim Link Reset"
─────────────────────────
Link: "← Kembali ke login" → /login
```

**Zod schema:**
```ts
resetSchema = z.object({
  email: z.string().email('Email tidak valid'),
})
```

**Behavior:**
- Submit → `supabase.auth.resetPasswordForEmail()`
- Success → `toast.success('Link reset sudah dikirim. Cek inbox kamu.')` + disable button
- Error → `toast.error('Gagal mengirim email. Coba lagi.')`

---

## 5. Validation Pattern

```
Field error  → react-hook-form + zod, tampil inline di bawah input (text-sm, text-destructive)
Server error → toast.error() via Sonner
Success      → toast.success() via Sonner
```

Sonner `<Toaster>` dipasang di root layout dengan `position="bottom-right"`, `theme="dark"`.

---

## 6. Phase 2 Notes

- **Google OAuth:** Slot button sudah ada di Login dan Signup (hidden/commented). Implementasi butuh: Google Cloud Console OAuth credentials + `supabase.auth.signInWithOAuth({ provider: 'google' })`.
- **Apple OAuth:** Out of scope sampai ada kebutuhan.

---

## 7. Implementation Order

1. Install + configure shadcn/ui
2. Update `globals.css` dengan brand CSS variables
3. Build UI primitives: Button → Input + Label → Card → Badge → Dialog
4. Setup Sonner `<Toaster>` di root layout
5. Build `Logo` component
6. Build `LoginForm` → `SignupForm` → `ResetPasswordForm`
7. Wire auth pages ke Supabase Auth
8. Test full flow: signup → verify email → login → redirect dashboard
