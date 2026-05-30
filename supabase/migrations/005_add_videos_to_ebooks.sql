-- supabase/migrations/005_add_videos_to_ebooks.sql
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT NULL;
