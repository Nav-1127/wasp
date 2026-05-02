-- Phase 3b-ii: Per-category comment settings
-- Replaces the blunt engagement_level dropdown with per-category respond + routing control.
-- Run this in the Supabase SQL editor.

-- category_settings stores respond (bool) and routing ('public'|'both') per comment category.
-- Defaults encode the smart baseline: customer support and discount requests route to DM,
-- everything else is public. Spam and noise are skipped by default.

ALTER TABLE brand_accounts
  ADD COLUMN IF NOT EXISTS category_settings JSONB NOT NULL DEFAULT '{
    "customer_support":    {"respond": true,  "routing": "both"},
    "purchase_intent":     {"respond": true,  "routing": "public"},
    "discount_promo":      {"respond": true,  "routing": "both"},
    "compliment":          {"respond": true,  "routing": "public"},
    "meaningful_feedback": {"respond": true,  "routing": "public"},
    "spam_noise":          {"respond": false, "routing": "public"},
    "other":               {"respond": false, "routing": "public"}
  }'::jsonb;
