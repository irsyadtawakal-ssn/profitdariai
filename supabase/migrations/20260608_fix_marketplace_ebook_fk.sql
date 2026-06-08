-- Fix FK constraint on marketplace_products.ebook_id
-- Previously had no ON DELETE action, causing 500 error when deleting an ebook
-- that is linked to a marketplace product. Now SET NULL on delete.

ALTER TABLE public.marketplace_products
  DROP CONSTRAINT IF EXISTS marketplace_products_ebook_id_fkey;

ALTER TABLE public.marketplace_products
  ADD CONSTRAINT marketplace_products_ebook_id_fkey
  FOREIGN KEY (ebook_id) REFERENCES public.ebooks(id) ON DELETE SET NULL;
