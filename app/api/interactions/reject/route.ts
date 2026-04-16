// app/api/interactions/reject/route.ts
// Reject a pending interaction — marks it as 'rejected' without sending anything.

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

  if (interaction.status !== "pending" && interaction.status !== "failed") {
    return Response.json(
      { error: `Cannot reject an interaction with status '${interaction.status}'` },
      { status: 409 }
    );
  }

  await admin
    .from("interactions")
    .update({ status: "rejected" })
    .eq("id", interaction_id);

  return Response.json({ ok: true });
}
