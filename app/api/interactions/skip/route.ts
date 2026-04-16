// app/api/interactions/skip/route.ts
// Skip a pending interaction — marks it as 'skipped' (softer than reject,
// means "I saw it but chose not to engage" rather than "this response is wrong").

import { NextRequest } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  let body: { interaction_id?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { interaction_id } = body;
  if (!interaction_id) {
    return Response.json({ error: "interaction_id is required" }, { status: 400 });
  }

  const { data: interaction } = await admin
    .from("interactions")
    .select("id, user_id, status")
    .eq("id", interaction_id)
    .eq("user_id", user.id)
    .single();

  if (!interaction) {
    return Response.json({ error: "Interaction not found" }, { status: 404 });
  }

  await admin
    .from("interactions")
    .update({ status: "skipped" })
    .eq("id", interaction_id);

  return Response.json({ ok: true });
}
