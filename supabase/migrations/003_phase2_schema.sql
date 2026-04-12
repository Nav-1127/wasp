-- Phase 2a Schema
-- Run this in the Supabase SQL Editor (after 001_waitlist.sql)
-- Safe to run even if 002_full_schema.sql was already executed (uses IF NOT EXISTS + DROP NOT NULL)

-- ─── brand_accounts ──────────────────────────────────────────────────────────
-- One row per user. Created at onboarding Step 0 (before Instagram is connected).
-- Instagram fields are nullable — filled in during Phase 2b OAuth flow.

CREATE TABLE IF NOT EXISTS brand_accounts (
  id                              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                         UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  -- Instagram (Phase 2b — nullable until connected)
  instagram_user_id               TEXT,
  instagram_handle                TEXT,
  instagram_access_token_encrypted TEXT,
  token_expires_at                TIMESTAMPTZ,
  profile_pic_url                 TEXT,
  follower_count                  INTEGER,
  -- Brand voice / personality
  personality_profile             JSONB,
  personality_prompt              TEXT,
  -- Agent mode controls
  agent_mode   TEXT DEFAULT 'draft' CHECK (agent_mode   IN ('draft', 'auto')),
  comment_mode TEXT DEFAULT 'draft' CHECK (comment_mode IN ('draft', 'auto')),
  dm_mode      TEXT DEFAULT 'draft' CHECK (dm_mode      IN ('draft', 'auto')),
  story_mode   TEXT DEFAULT 'draft' CHECK (story_mode   IN ('draft', 'auto')),
  -- Onboarding
  account_type         TEXT    DEFAULT 'brand' CHECK (account_type IN ('brand', 'creator')),
  onboarding_step      INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- If 002 was already run with NOT NULL on instagram fields, drop those constraints
DO $$
BEGIN
  ALTER TABLE brand_accounts ALTER COLUMN instagram_user_id DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TABLE brand_accounts ALTER COLUMN instagram_handle DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TABLE brand_accounts ALTER COLUMN instagram_access_token_encrypted DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Add onboarding_step if 002 ran without it
DO $$
BEGIN
  ALTER TABLE brand_accounts ADD COLUMN onboarding_step INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add UNIQUE constraint on user_id if missing
DO $$
BEGIN
  ALTER TABLE brand_accounts ADD CONSTRAINT brand_accounts_user_id_key UNIQUE (user_id);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE brand_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own brand accounts" ON brand_accounts;
CREATE POLICY "Users can manage own brand accounts"
  ON brand_accounts
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── products ─────────────────────────────────────────────────────────────────
-- Stores products (brands) or links/offers (creators). UI label = "Products & Links".

CREATE TABLE IF NOT EXISTS products (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_account_id UUID REFERENCES brand_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name             TEXT NOT NULL,
  description      TEXT,
  price_range      TEXT,
  url              TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own products" ON products;
CREATE POLICY "Users can manage own products"
  ON products
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── engagement_goals ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS engagement_goals (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_account_id UUID REFERENCES brand_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('comment', 'dm', 'story_reply')),
  goal             TEXT NOT NULL CHECK (goal IN (
    'engage', 'collect_email', 'send_link', 'book_call', 'drive_to_dm',
    'grow_engagement', 'build_community', 'drive_clicks', 'convert_followers'
  )),
  goal_url         TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(brand_account_id, interaction_type)
);

ALTER TABLE engagement_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own engagement goals" ON engagement_goals;
CREATE POLICY "Users can manage own engagement goals"
  ON engagement_goals
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── interactions ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS interactions (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_account_id      UUID REFERENCES brand_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id               UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  instagram_user_id     TEXT,
  instagram_username    TEXT,
  interaction_type      TEXT NOT NULL CHECK (interaction_type IN ('comment', 'dm', 'story_reply')),
  source_post_id        TEXT,
  source_post_thumbnail TEXT,
  message_text          TEXT NOT NULL,
  drafted_response      TEXT,
  final_response        TEXT,
  status                TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'edited', 'rejected', 'auto_sent', 'skipped'
  )),
  responded_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own interactions" ON interactions;
CREATE POLICY "Users can manage own interactions"
  ON interactions
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS interactions_pending_idx
  ON interactions (brand_account_id, status, created_at DESC)
  WHERE status = 'pending';

-- ─── conversation_threads ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversation_threads (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_account_id    UUID REFERENCES brand_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  instagram_user_id   TEXT NOT NULL,
  instagram_username  TEXT,
  messages            JSONB DEFAULT '[]'::jsonb,
  status              TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'handed_off')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE conversation_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own conversation threads" ON conversation_threads;
CREATE POLICY "Users can manage own conversation threads"
  ON conversation_threads
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── usage_tracking ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS usage_tracking (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month          TEXT NOT NULL,
  responses_used INTEGER DEFAULT 0,
  plan           TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  UNIQUE(user_id, month)
);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage" ON usage_tracking;
CREATE POLICY "Users can view own usage"
  ON usage_tracking
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── updated_at trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_brand_accounts_updated_at ON brand_accounts;
CREATE TRIGGER update_brand_accounts_updated_at
  BEFORE UPDATE ON brand_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversation_threads_updated_at ON conversation_threads;
CREATE TRIGGER update_conversation_threads_updated_at
  BEFORE UPDATE ON conversation_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
