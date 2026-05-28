-- Row Level Security policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role (avoids infinite recursion in policies)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT USING (is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- courses: public read if published
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT USING (is_published = true);

CREATE POLICY "Admins manage courses"
  ON courses FOR ALL USING (is_admin());

-- course_modules: visible to all, content access enforced at app level
CREATE POLICY "Public view modules metadata"
  ON course_modules FOR SELECT USING (true);

CREATE POLICY "Admins manage modules"
  ON course_modules FOR ALL USING (is_admin());

-- ebooks: public metadata, file via signed URL only
CREATE POLICY "Public view published ebook metadata"
  ON ebooks FOR SELECT USING (is_published = true);

CREATE POLICY "Admins manage ebooks"
  ON ebooks FOR ALL USING (is_admin());

-- transactions: own only
CREATE POLICY "Users view own transactions"
  ON transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins view all transactions"
  ON transactions FOR SELECT USING (is_admin());
