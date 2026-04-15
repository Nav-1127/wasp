import { NextRequest } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";

// ── GET — list all triggers for the current user ───────────────────────────────
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: triggers, error } = await admin
      .from("sting_triggers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ triggers: triggers ?? [] });
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ── POST — create a new trigger ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    // Get brand_account_id
    const { data: account, error: accountError } = await admin
      .from("brand_accounts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (accountError || !account) {
      return Response.json({ error: "Account not found" }, { status: 404 });
    }

    const body = await request.json();

    const {
      name,
      trigger_type,
      trigger_keywords,
      trigger_description,
      comment_reply,
      dm_message,
      dm_link,
      applies_to,
      specific_post_ids,
      is_active,
    } = body;

    // Validate required fields
    if (!name || !comment_reply || !dm_message) {
      return Response.json(
        { error: "name, comment_reply and dm_message are required" },
        { status: 400 }
      );
    }

    const { data: trigger, error } = await admin
      .from("sting_triggers")
      .insert({
        brand_account_id: account.id,
        user_id: user.id,
        name,
        trigger_type: trigger_type ?? "keyword",
        trigger_keywords: trigger_keywords ?? [],
        trigger_description: trigger_description ?? null,
        comment_reply,
        dm_message,
        dm_link: dm_link ?? null,
        applies_to: applies_to ?? "all_posts",
        specific_post_ids: specific_post_ids ?? [],
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ trigger }, { status: 201 });
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
