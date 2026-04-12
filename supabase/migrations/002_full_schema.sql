-- Phase 2+ Full Schema
-- Run AFTER 001_waitlist.sql when building Phase 2

-- Brand Accounts
CREATE TABLE IF NOT EXISTS brand_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  instagram_user_id TEXT NOT NULL,
  instagram_handle TEXT NOT NULL,
  instagram_access_token_encrypted TEXT NOT NULL,
  profile_pic_url TEXT,
  follower_count INTEGER,
  personality_profile JSONB,
  personality_prompt TEXT,
  agent_mode TEXT DEFAULT 'draft' CHECK (agent_mode IN ('draft', 'auto')),
  comment_mode TEXT DEFAULT 'draft' CHECK (comment_mode IN ('draft', 'auto')),
  dm_mode TEXT DEFAULT 'draft' CHECK (dm_mode IN ('draft', 'auto')),
  story_mode TEXT DEFAULT 'draft' CHECK (story_mode IN ('draft', 'auto')),
  account_type TEXT DEFAULT 'brand' CHECK (account_type IN ('brand', 'creator')),
  onboarding_completed BOOLEAN DEFAULT false,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE brand_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own brand accounts"
  ON brand_accounts
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Products / Services
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_account_id UUID REFERENCES brand_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_range TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own products"
  ON products
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Engagement Goals
CREATE TABLE IF NOT EXISTS engagement_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_account_id UUID REFERENCES brand_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('comment', 'dm', 'story_reply')),
  goal TEXT NOT NULL CHECK (goal IN ('engage', 'collect_email', 'send_link', 'book_call', 'drive_to_dm')),
  goal_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(brand_account_id, interaction_type)
);

ALTER TABLE engagement_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own engagement goals"
  ON engagement_goals
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Interactions
CREATE TABLE IF NOT EXISTS interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_account_id UUID REFERENCES brand_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  instagram_user_id TEXT,
  instagram_username TEXT,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('comment', 'dm', 'story_reply')),
  source_post_id TEXT,
  source_post_thumbnail TEXT,
  message_text TEXT NOT NULL,
  drafted_response TEXT,
  final_response TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'edited', 'rejected', 'auto_sent', 'skipped')),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own interactions"
  ON interactions
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Index for real-time pending queries
CREATE INDEX IF NOT EXISTS interactions_pending_idx
  ON interactions (brand_account_id, status, created_at DESC)
  WHERE status = 'pending';

-- Conversation Threads
CREATE TABLE IF NOT EXISTS conversation_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_account_id UUID REFERENCES brand_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  instagram_user_id TEXT NOT NULL,
  instagram_username TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'handed_off')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE conversation_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversation threads"
  ON conversation_threads
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Usage Tracking
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  responses_used INTEGER DEFAULT 0,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  UNIQUE(user_id, month)
);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON usage_tracking
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
