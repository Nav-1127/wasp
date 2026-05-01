-- Phase 3b: Comment Sensitivity Routing
-- Adds routing_decision, sensitivity_reason, and public_acknowledgement to interactions.
-- Adds sensitivity_routing_enabled, auto_reply_sensitive, and sensitivity_keywords to brand_accounts.
-- Run this in the Supabase SQL editor (production + any dev Supabase project).

-- ── interactions table ─────────────────────────────────────────────────────────

-- Where the reply will be sent: normal public comment reply, or public acknowledgement + DM
ALTER TABLE interactions
  ADD COLUMN IF NOT EXISTS routing_decision TEXT
  CHECK (routing_decision IN ('public', 'both'));

-- Short label explaining why WASP flagged this as sensitive (e.g. "discount request")
ALTER TABLE interactions
  ADD COLUMN IF NOT EXISTS sensitivity_reason TEXT;

-- The short public reply for 'both' routing (e.g. "I've sent you a DM!")
-- drafted_response becomes the DM content when routing is dm_only or both.
ALTER TABLE interactions
  ADD COLUMN IF NOT EXISTS public_acknowledgement TEXT;

-- ── brand_accounts table ───────────────────────────────────────────────────────

-- Master toggle: should WASP classify and route sensitive comments?
-- Default ON — this is the safety net that protects every brand out of the box.
ALTER TABLE brand_accounts
  ADD COLUMN IF NOT EXISTS sensitivity_routing_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Override toggle: should auto mode fire on sensitive comments too?
-- Default OFF — sensitive comments are held for human review even in auto mode.
ALTER TABLE brand_accounts
  ADD COLUMN IF NOT EXISTS auto_reply_sensitive BOOLEAN NOT NULL DEFAULT FALSE;

-- Optional custom sensitivity keywords the brand wants flagged for DM routing.
-- Stored as a text array, e.g. '{"promo","refund","broken"}'.
ALTER TABLE brand_accounts
  ADD COLUMN IF NOT EXISTS sensitivity_keywords TEXT[] NOT NULL DEFAULT '{}';
