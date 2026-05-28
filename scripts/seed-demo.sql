-- Insert 5 demo courses
INSERT INTO courses (slug, title, description, category, thumbnail_url, is_published, sort_order) VALUES
('ai-basics', 'AI Fundamentals', 'Pelajari dasar-dasar kecerdasan buatan dari nol', 'Bisnis', 'https://images.unsplash.com/photo-1677442d019cecf8d1b94c900edff58e92118e01be66b72021e0b0641e81434e?w=400&h=300&fit=crop', true, 1),
('freelance-guide', 'Panduan Freelance 2026', 'Mulai karir freelance dan dapatkan klien pertama', 'Freelancing', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop', true, 2),
('content-mastery', 'Kuasai Content Creation', 'Buat konten viral untuk media sosial', 'Konten', 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop', true, 3),
('automation-biz', 'Otomasi Bisnis Online', 'Tingkatkan revenue dengan automation tools', 'Otomasi', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop', true, 4),
('digital-marketing', 'Digital Marketing Pro', 'Strategi marketing yang terbukti menghasilkan', 'Bisnis', 'https://images.unsplash.com/photo-1460925895917-adf4e565db7d?w=400&h=300&fit=crop', true, 5);

-- Insert 1 module per course (YouTube demo videos)
INSERT INTO course_modules (course_id, title, description, video_url, duration_seconds, sort_order) VALUES
((SELECT id FROM courses WHERE slug='ai-basics'), 'Intro ke AI', 'Kenalan dengan konsep AI', 'dQw4w9WgXcQ', 600, 1),
((SELECT id FROM courses WHERE slug='freelance-guide'), 'Mulai Freelance', 'Step pertama menjadi freelancer', 'dQw4w9WgXcQ', 900, 1),
((SELECT id FROM courses WHERE slug='content-mastery'), 'Content Strategy', 'Merencanakan konten yang viral', 'dQw4w9WgXcQ', 1200, 1),
((SELECT id FROM courses WHERE slug='automation-biz'), 'Tools Automation', 'Pilih tools yang tepat', 'dQw4w9WgXcQ', 800, 1),
((SELECT id FROM courses WHERE slug='digital-marketing'), 'Strategi SEO', 'Dominasi Google Search', 'dQw4w9WgXcQ', 1500, 1);

-- Insert 5 demo ebooks
INSERT INTO ebooks (slug, title, description, category, cover_url, file_path, page_count, is_published, sort_order) VALUES
('ai-guide', 'Panduan Lengkap AI', 'E-book 150 halaman tentang AI untuk pemula', 'Bisnis', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=400&fit=crop', 'ebooks/ai-guide.pdf', 150, true, 1),
('freelance-toolkit', 'Freelancer Toolkit', 'Checklist & template untuk freelancer sukses', 'Freelancing', 'https://images.unsplash.com/photo-1495446815901-a7297e8b7f3d?w=300&h=400&fit=crop', 'ebooks/freelance-toolkit.pdf', 80, true, 2),
('viral-secrets', 'Rahasia Konten Viral', 'Anatomis konten yang menghasilkan 1M views', 'Konten', 'https://images.unsplash.com/photo-1507842217343-583b917d8d71?w=300&h=400&fit=crop', 'ebooks/viral-secrets.pdf', 120, true, 3),
('automation-101', 'Automation 101', 'Panduan lengkap otomasi bisnis dari A-Z', 'Otomasi', 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=300&h=400&fit=crop', 'ebooks/automation-101.pdf', 200, true, 4),
('marketing-playbook', 'Marketing Playbook', 'Playbook marketing yang dipakai startup sukses', 'Bisnis', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&h=400&fit=crop', 'ebooks/marketing-playbook.pdf', 180, true, 5);
