-- Produk bump di checkout step 2 (1 ebook, harga miring)
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS is_bump_product BOOLEAN DEFAULT false;
ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS bump_price INTEGER;
