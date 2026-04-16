// app/api/settings/agent-mode/route.ts
// Updates agent_mode and/or per-type modes (comment_mode, dm_mode, story_mode)
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

    const updates: Record<string, string> = {};
    if (isValidMode(body.agent_mode)) updates.agent_mode = body.agent_mode;
    if (isValidMode(body.comment_mode)) updates.comment_mode = body.comment_mode;
    if (isValidMode(body.dm_mode)) updates.dm_mode = body.dm_mode;
    if (isValidMode(body.story_mode)) updates.story_mode = body.story_mode;

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
