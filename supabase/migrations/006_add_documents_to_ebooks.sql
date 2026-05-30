-- supabase/migrations/006_add_documents_to_ebooks.sql
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT NULL;
