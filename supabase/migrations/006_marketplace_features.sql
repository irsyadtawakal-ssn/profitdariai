ALTER TABLE marketplace_products ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';
