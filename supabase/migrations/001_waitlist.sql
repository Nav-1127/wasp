-- Phase 1: Waitlist table
-- Run this in your Supabase SQL editor or via Supabase CLI

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist (email);
CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON waitlist (created_at DESC);

-- Enable RLS (no auth required for waitlist, but good practice)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into waitlist (public endpoint)
CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

-- Allow anyone to count waitlist entries (for social proof counter)
CREATE POLICY "Anyone can count waitlist"
  ON waitlist FOR SELECT
  USING (true);
