-- Phase 2e: Webhook Receiver + AI Agent Engine
-- Extends the interactions table for the full agent pipeline.
-- Run this in the Supabase SQL editor.

-- ── Extend interactions status values ─────────────────────────────────────────
-- Add 'failed' (Instagram API error) and 'queued' (rate-limited, waiting to send)
-- Note: PostgreSQL check constraints can only be dropped by name.
-- The auto-generated name from 002_full_schema.sql is interactions_status_check.

DO $$ BEGIN
  ALTER TABLE interactions DROP CONSTRAINT IF EXISTS interactions_status_check;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE interactions
  ADD CONSTRAINT interactions_status_check
  CHECK (status IN (
    'pending',    -- drafted, awaiting human approval
    'approved',   -- human approved, sent via Instagram API
    'edited',     -- human edited and sent
    'rejected',   -- human rejected, not sent
    'auto_sent',  -- agent sent automatically (auto mode)
    'skipped',    -- human skipped / dismissed
    'failed',     -- Instagram API call failed
    'queued'      -- rate-limited, queued for later send
  ));

-- ── New columns on interactions ────────────────────────────────────────────────

-- Instagram comment ID — needed to reply to a specific comment via Graph API
ALTER TABLE interactions
  ADD COLUMN IF NOT EXISTS source_comment_id TEXT;

-- Story context — the caption/text of the story that was replied to
ALTER TABLE interactions
  ADD COLUMN IF NOT EXISTS story_context TEXT;

-- Error message — populated when status = 'failed'
ALTER TABLE interactions
  ADD COLUMN IF NOT EXISTS error_message TEXT;

-- ── Index for queued messages ──────────────────────────────────────────────────
-- Used by the rate limiter to drain queued messages in priority order
CREATE INDEX IF NOT EXISTS interactions_queued_idx
  ON interactions (brand_account_id, interaction_type, created_at DESC)
  WHERE status = 'queued';
