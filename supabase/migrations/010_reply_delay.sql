-- 010_reply_delay.sql
-- Adds human reply delay settings to brand_accounts and a scheduled_send_at
-- timestamp to interactions. When scheduled_send_at is set, the interaction
-- is held in the queue until that time before being dispatched to Instagram.

ALTER TABLE brand_accounts
  ADD COLUMN IF NOT EXISTS reply_delay_mode TEXT NOT NULL DEFAULT 'short',
  ADD COLUMN IF NOT EXISTS reply_delay_min_seconds INT NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS reply_delay_max_seconds INT NOT NULL DEFAULT 120;

ALTER TABLE interactions
  ADD COLUMN IF NOT EXISTS scheduled_send_at TIMESTAMPTZ NULL;

-- Index so processScheduled can efficiently find ready-to-send interactions
CREATE INDEX IF NOT EXISTS idx_interactions_scheduled
  ON interactions (brand_account_id, scheduled_send_at)
  WHERE status = 'scheduled';
