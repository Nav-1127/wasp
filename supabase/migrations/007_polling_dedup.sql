-- Phase 2g: Polling Fallback + Deduplication
-- Ensures every comment and DM is stored exactly once,
-- whether it arrived via Meta webhook or the polling fallback.
-- Run this in the Supabase SQL editor.

-- ── Comment deduplication ──────────────────────────────────────────────────────
-- source_comment_id already stores the Instagram comment ID for all comment rows.
-- Add a partial unique index so we can deduplicate across webhook + polling paths.

CREATE UNIQUE INDEX IF NOT EXISTS interactions_source_comment_id_unique
  ON interactions (source_comment_id)
  WHERE source_comment_id IS NOT NULL;

-- ── DM deduplication ──────────────────────────────────────────────────────────
-- Add instagram_message_id to store the unique Instagram message ID for DMs/story replies.

ALTER TABLE interactions
  ADD COLUMN IF NOT EXISTS instagram_message_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS interactions_instagram_message_id_unique
  ON interactions (instagram_message_id)
  WHERE instagram_message_id IS NOT NULL;
