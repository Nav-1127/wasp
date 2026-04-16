-- Phase 2d Fix: Simpler engagement goals model
-- Replace per-interaction-type goals with a single primary_objective on brand_accounts
-- and a flexible account_assets table for links/resources the agent can share contextually.
--
-- Run this in the Supabase SQL editor.

-- ── primary_objective on brand_accounts ───────────────────────────────────────
-- One top-level goal that shapes every conversation WASP has.

ALTER TABLE brand_accounts
  ADD COLUMN IF NOT EXISTS primary_objective TEXT DEFAULT 'grow_engagement'
  CHECK (primary_objective IN (
    'grow_engagement',   -- build genuine connections and community
    'drive_sales',       -- guide people toward products/services naturally
    'grow_email_list',   -- collect emails through organic conversation
    'book_calls',        -- guide interested people to schedule a call
    'grow_followers',    -- turn commenters into followers
    'mix'                -- agent uses judgment per conversation
  ));

-- ── account_assets table ──────────────────────────────────────────────────────
-- Links, resources, or assets the agent can share contextually.
-- The agent decides WHEN to share each one based on conversation context
-- and the "when_to_share" description. Nothing is shared automatically or forced.

CREATE TABLE IF NOT EXISTS account_assets (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_account_id UUID        NOT NULL REFERENCES brand_accounts(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label            TEXT        NOT NULL,          -- e.g. "My website", "Free guide", "Book a call"
  url              TEXT        NOT NULL,          -- the actual link
  when_to_share    TEXT,                          -- e.g. "When someone asks about my services"
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE account_assets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'account_assets'
      AND policyname = 'Users can manage own account assets'
  ) THEN
    CREATE POLICY "Users can manage own account assets"
      ON account_assets FOR ALL
      USING  (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- ── Note on engagement_goals table ───────────────────────────────────────────
-- The engagement_goals table is kept as-is for backward compatibility.
-- New onboarding no longer writes to it — primary_objective replaces it.
-- It can be dropped in a future cleanup migration once confirmed unused.
