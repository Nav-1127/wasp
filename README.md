# WASP — Your Brand's AI Personality on Instagram

WASP is an AI-powered Instagram engagement agent that learns your brand's voice and handles comments, DMs, and story replies 24/7.

**Domain:** joinwasp.com  
**Tagline:** "Put your Instagram's Engagement on Auto-Pilot with Wasp's AI Agent"

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Styling:** Tailwind CSS v4
- **Auth & Database:** Supabase (Auth, Postgres, RLS, Real-time)
- **AI:** Anthropic Claude API (Haiku 4.5 for responses, Sonnet 4.6 for analysis)
- **Instagram:** Meta Instagram Graph API + Messaging API + Webhooks
- **Deployment:** Vercel → joinwasp.com

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) account (free tier works)
- Meta Developer account with an Instagram app (Phase 2)
- Anthropic API key (Phase 2)

### Setup

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd wasp
   npm install
   ```

2. **Environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `.env.local` with your Supabase URL and keys.

3. **Supabase — run migrations**

   Go to your Supabase project → SQL Editor and run:
   - `supabase/migrations/001_waitlist.sql` — Phase 1 (waitlist table + RLS)
   - `supabase/migrations/002_full_schema.sql` — Phase 2+ (full schema)

4. **Start dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

See `.env.example` for all required variables.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Phase 1 | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Phase 1 | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Phase 1 | Supabase service role key (server-only) |
| `META_APP_ID` | Phase 2 | Meta app ID |
| `META_APP_SECRET` | Phase 2 | Meta app secret |
| `WEBHOOK_VERIFY_TOKEN` | Phase 2 | Random string for Meta webhook verification |
| `ANTHROPIC_API_KEY` | Phase 2 | Anthropic API key |
| `NEXT_PUBLIC_APP_URL` | Both | App URL (`https://joinwasp.com` in production) |

---

## Project Structure

```
/app
  /(marketing)
    /page.tsx              — Landing page
    /pricing/page.tsx      — Pricing page
    /privacy/page.tsx      — Privacy policy (placeholder)
    /terms/page.tsx        — Terms of service (placeholder)
  /api
    /waitlist/route.ts     — Waitlist signup + count endpoint
/components
  /landing                 — Landing page sections
    Nav.tsx
    Hero.tsx               — Email waitlist form
    HowItWorks.tsx
    Problem.tsx
    BeforeAfter.tsx
    PricingPreview.tsx
    Footer.tsx
/lib
  /supabase.ts             — Supabase client (browser + server + admin)
/supabase
  /migrations
    001_waitlist.sql       — Phase 1: waitlist table
    002_full_schema.sql    — Phase 2+: full schema
```

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.example`
4. Deploy — Vercel auto-deploys on every push to `main`

### Domain

Point `joinwasp.com` to Vercel via your DNS provider:
- Add a CNAME record: `www` → `cname.vercel-dns.com`
- Add an A record: `@` → Vercel's IP (shown in Vercel project settings)

---

## Build Phases

| Phase | Status | Description |
|---|---|---|
| **Phase 1** | ✅ Done | Landing page, waitlist, pricing, privacy/terms, Vercel deploy |
| **Phase 2** | 🔜 Next | Auth, Instagram OAuth, brand analysis, onboarding, webhook, dashboard |
| **Phase 3** | ⏳ Later | Analytics, auto mode, settings, conversation threads |
| **Phase 4** | ⏳ Later | Stripe billing, multi-account, team invites, Shopify |

---

## Security

- All Instagram tokens encrypted at rest (AES-256) — Phase 2
- Row Level Security on all Supabase tables
- Webhook signature verification for Meta events — Phase 2
- Server-side only API calls (no tokens in browser)
- `httpOnly` cookies via Supabase Auth — Phase 2

---

