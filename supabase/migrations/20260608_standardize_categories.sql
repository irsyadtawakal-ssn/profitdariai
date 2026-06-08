-- Standardize categories to: Materi, Tools, Lainnya
-- Old → New mapping:
--   Bisnis, Freelancing, Konten, Prompt, Ebook → Materi
--   Otomasi, Template, Preset → Tools
--   anything else → Lainnya

-- ebooks table
UPDATE ebooks SET category = 'Materi'
WHERE category IN ('Bisnis', 'Freelancing', 'Konten', 'Prompt', 'Ebook');

UPDATE ebooks SET category = 'Tools'
WHERE category IN ('Otomasi', 'Template', 'Preset');

UPDATE ebooks SET category = 'Lainnya'
WHERE category NOT IN ('Materi', 'Tools', 'Lainnya');

-- marketplace_products table
UPDATE marketplace_products SET category = 'Materi'
WHERE category IN ('Bisnis', 'Freelancing', 'Konten', 'Prompt', 'Ebook', 'E-BOOKS');

UPDATE marketplace_products SET category = 'Tools'
WHERE category IN ('Otomasi', 'Template', 'Preset');

UPDATE marketplace_products SET category = 'Lainnya'
WHERE category NOT IN ('Materi', 'Tools', 'Lainnya');

-- courses table
UPDATE courses SET category = 'Materi'
WHERE category IN ('Bisnis', 'Freelancing', 'Konten', 'Prompt', 'Ebook');

UPDATE courses SET category = 'Tools'
WHERE category IN ('Otomasi', 'Template', 'Preset');

UPDATE courses SET category = 'Lainnya'
WHERE category NOT IN ('Materi', 'Tools', 'Lainnya');
