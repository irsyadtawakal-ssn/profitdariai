-- Create pixel_events table for tracking customer journey events
-- Tracks form_submit, pending_payment, checkout_complete and other conversion funnel events

CREATE TABLE pixel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  user_email VARCHAR(255),
  user_id UUID,
  session_id VARCHAR(255),
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  page_url VARCHAR(500)
);

COMMENT ON TABLE pixel_events IS 'Tracks customer journey events for Meta Pixel and conversion funnel analysis. Records form submissions, pending payments, and checkout completions.';

-- Create indexes for efficient querying
CREATE INDEX idx_pixel_events_type ON pixel_events(event_type);
CREATE INDEX idx_pixel_events_created_at ON pixel_events(created_at);
CREATE INDEX idx_pixel_events_email ON pixel_events(user_email);
CREATE INDEX idx_pixel_events_type_created ON pixel_events(event_type, created_at DESC);
