-- ============================================================
-- Migration: User Ebooks Ownership System
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create user_ebooks table (tracks which ebooks each user owns)
CREATE TABLE IF NOT EXISTS public.user_ebooks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ebook_id uuid NOT NULL REFERENCES public.ebooks(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'checkout', -- 'checkout' | 'marketplace' | 'admin'
  purchased_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, ebook_id)
);

-- 2. Enable Row Level Security
ALTER TABLE public.user_ebooks ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policy: users can only see their own ebooks
CREATE POLICY "users_select_own_ebooks"
  ON public.user_ebooks
  FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Add ebook_id to marketplace_products (links marketplace item to an ebook)
ALTER TABLE public.marketplace_products
  ADD COLUMN IF NOT EXISTS ebook_id uuid REFERENCES public.ebooks(id);

-- 5. (Optional) Index for performance
CREATE INDEX IF NOT EXISTS user_ebooks_user_id_idx ON public.user_ebooks(user_id);
CREATE INDEX IF NOT EXISTS user_ebooks_ebook_id_idx ON public.user_ebooks(ebook_id);
