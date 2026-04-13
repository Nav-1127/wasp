-- Phase 2c: Engagement Level Control + Sting Triggers
-- Run this in the Supabase SQL editor

-- ── Engagement Level on brand_accounts ────────────────────────────────────────
-- How WASP handles comment volume. DMs/story replies always get a response.
ALTER TABLE brand_accounts
  ADD COLUMN IF NOT EXISTS engagement_level TEXT DEFAULT 'smart_select'
  CHECK (engagement_level IN ('reply_all', 'smart_select', 'questions_only', 'manual_pick'));

-- ── Sting Triggers table ───────────────────────────────────────────────────────
-- Comment-to-DM automations: when someone comments with certain keywords/intent,
-- WASP replies publicly AND sends them a DM simultaneously.
CREATE TABLE IF NOT EXISTS sting_triggers (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_account_id    UUID        NOT NULL REFERENCES brand_accounts(id) ON DELETE CASCADE,
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                TEXT        NOT NULL,
  trigger_type        TEXT        NOT NULL DEFAULT 'keyword'
                                  CHECK (trigger_type IN ('keyword', 'smart_intent')),
  trigger_keywords    TEXT[],                    -- for keyword mode
  trigger_description TEXT,                      -- for smart_intent mode
  comment_reply       TEXT        NOT NULL,      -- public reply on the comment
  dm_message          TEXT        NOT NULL,      -- private DM sent to commenter
  dm_link             TEXT,                      -- optional link included in DM
  applies_to          TEXT        NOT NULL DEFAULT 'all_posts'
                                  CHECK (applies_to IN ('all_posts', 'specific_posts')),
  specific_post_ids   TEXT[],
  is_active           BOOLEAN     DEFAULT true,
  times_triggered     INTEGER     DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ── Extend interactions table for Phase 2c ────────────────────────────────────
ALTER TABLE interactions
  ADD COLUMN IF NOT EXISTS sting_trigger_id UUID REFERENCES sting_triggers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS comment_category TEXT;

-- ── RLS for sting_triggers ─────────────────────────────────────────────────────
ALTER TABLE sting_triggers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'sting_triggers'
      AND policyname = 'Users can manage own sting triggers'
  ) THEN
    CREATE POLICY "Users can manage own sting triggers"
      ON sting_triggers FOR ALL
      USING  (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;
