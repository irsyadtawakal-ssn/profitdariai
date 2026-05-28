-- supabase/migrations/004_marketplace.sql

create table if not exists marketplace_products (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  description    text,
  category       text not null,
  price          integer not null default 0,
  original_price integer,
  cover_url      text,
  product_url    text not null,
  is_published   boolean not null default false,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table marketplace_products enable row level security;

-- Member hanya lihat produk published
create policy "members_select_published" on marketplace_products
  for select using (is_published = true);

-- Admin (service_role) full access — bypass RLS secara otomatis
