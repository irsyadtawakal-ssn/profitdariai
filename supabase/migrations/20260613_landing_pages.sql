-- supabase/migrations/20260613_landing_pages.sql

create table if not exists landing_pages (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  html        text not null,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table landing_pages enable row level security;

-- Read publik hanya untuk landing yang published
create policy "public_select_published" on landing_pages
  for select using (published = true);

-- Admin pakai service_role (createAdminClient) yang bypass RLS, jadi
-- tidak perlu policy write tambahan. requireAdmin() menjaga di layer action.

create index if not exists landing_pages_slug_idx on landing_pages (slug);
