-- Site settings: key-value store untuk konfigurasi yang bisa diubah admin dari UI.
-- Dibaca/ditulis hanya via service_role (admin client) — tidak ada akses publik.

create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

-- Tidak ada policy untuk anon/authenticated → semua akses ditolak by default.
-- Hanya service_role (bypass RLS) yang boleh baca/tulis, lewat admin client server-side.

-- Seed key Meta Pixel (kosong, diisi dari halaman admin /admin/pengaturan)
insert into public.site_settings (key, value) values
  ('meta_pixel_id', ''),
  ('meta_capi_token', '')
on conflict (key) do nothing;
