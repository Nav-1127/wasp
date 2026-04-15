import { NextRequest } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";

// ── PATCH — update a trigger (edit fields, toggle active, etc.) ───────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const admin = createAdminClient();
    const { data: trigger, error } = await admin
      .from("sting_triggers")
      .update(body)
      .eq("id", id)
      .eq("user_id", user.id) // safety: user can only update their own
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    if (!trigger) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ trigger });
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ── DELETE — remove a trigger ──────────────────────────────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const admin = createAdminClient();
    const { error } = await admin
      .from("sting_triggers")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
