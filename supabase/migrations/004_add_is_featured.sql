-- supabase/migrations/004_add_is_featured.sql
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
