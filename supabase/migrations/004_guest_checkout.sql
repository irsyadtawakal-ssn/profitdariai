-- Allow guest checkout: make user_id optional and add customer info columns
ALTER TABLE transactions
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN customer_email TEXT,
  ADD COLUMN customer_name TEXT;

-- Add index for email-based lookups (for password reset)
CREATE INDEX idx_tx_email ON transactions(customer_email, created_at DESC);

-- Update policy to allow guest transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;

CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (
    auth.uid() = user_id
    OR (user_id IS NULL AND customer_email = auth.jwt() ->> 'email')
  );
