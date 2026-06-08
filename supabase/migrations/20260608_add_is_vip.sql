-- VIP flag untuk member yang ambil upsell konsultasi WhatsApp
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;
