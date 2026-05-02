// app/api/settings/agent-mode/route.ts
// Updates agent_mode, per-type modes, and sensitivity routing settings
// on the brand_accounts row for the authenticated user.

import { NextRequest } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";

const VALID_MODES = ["draft", "auto"] as const;
type Mode = (typeof VALID_MODES)[number];

function isValidMode(v: unknown): v is Mode {
  return typeof v === "string" && VALID_MODES.includes(v as Mode);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const admin = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {};
    if (isValidMode(body.agent_mode)) updates.agent_mode = body.agent_mode;
    if (isValidMode(body.comment_mode)) updates.comment_mode = body.comment_mode;
    if (isValidMode(body.dm_mode)) updates.dm_mode = body.dm_mode;
    if (isValidMode(body.story_mode)) updates.story_mode = body.story_mode;

    if (typeof body.auto_reply_sensitive === "boolean") {
      updates.auto_reply_sensitive = body.auto_reply_sensitive;
    }

    // Per-category settings
    if (body.category_settings && typeof body.category_settings === "object") {
      const VALID_CATEGORIES = [
        "customer_support", "purchase_intent", "discount_promo",
        "compliment", "meaningful_feedback", "spam_noise", "other",
      ];
      const sanitised: Record<string, { respond: boolean; routing: string }> = {};
      for (const cat of VALID_CATEGORIES) {
        const entry = body.category_settings[cat];
        if (entry && typeof entry === "object") {
          sanitised[cat] = {
            respond: typeof entry.respond === "boolean" ? entry.respond : true,
            routing: entry.routing === "both" ? "both" : "public",
          };
        }
      }
      if (Object.keys(sanitised).length > 0) {
        updates.category_settings = sanitised;
      }
    }

    // Reply delay settings
    const VALID_DELAY_MODES = ["off", "short", "medium", "custom"] as const;
    if (typeof body.reply_delay_mode === "string" && VALID_DELAY_MODES.includes(body.reply_delay_mode)) {
      updates.reply_delay_mode = body.reply_delay_mode;
    }
    if (typeof body.reply_delay_min_seconds === "number" && body.reply_delay_min_seconds >= 0) {
      updates.reply_delay_min_seconds = Math.min(600, Math.floor(body.reply_delay_min_seconds));
    }
    if (typeof body.reply_delay_max_seconds === "number" && body.reply_delay_max_seconds >= 30) {
      updates.reply_delay_max_seconds = Math.min(600, Math.floor(body.reply_delay_max_seconds));
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { error } = await admin
      .from("brand_accounts")
      .update(updates)
      .eq("user_id", user.id);

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
