// app/api/interactions/approve-all/route.ts
// Approves all pending interactions for the authenticated user in one operation.
// In mock mode: batch-updates all rows. In real mode: calls Instagram API for each,
// marking individual failures without aborting the whole batch.

import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";
import { replyToComment, sendDirectMessage, decryptToken } from "@/lib/instagram";

const isMockMode =
  !process.env.META_APP_ID || process.env.USE_MOCK_AUTH === "true";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  const { data: pending } = await admin
    .from("interactions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "pending");

  if (!pending || pending.length === 0) {
    return Response.json({ ok: true, approved: 0 });
  }

  const now = new Date().toISOString();

  if (isMockMode) {
    let approved = 0;
    for (const interaction of pending) {
      if (!interaction.drafted_response) continue;
      await admin
        .from("interactions")
        .update({
          status: "approved",
          final_response: interaction.drafted_response,
          responded_at: now,
        })
        .eq("id", interaction.id);
      approved++;
    }
    return Response.json({ ok: true, approved });
  }

  // Real mode — fetch access token once
  const { data: account } = await admin
    .from("brand_accounts")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!account?.instagram_access_token_encrypted) {
    return Response.json({ error: "No access token found" }, { status: 500 });
  }

  const token = decryptToken(account.instagram_access_token_encrypted);

  let approved = 0;
  for (const interaction of pending) {
    if (!interaction.drafted_response) continue;
    try {
      if (
        interaction.interaction_type === "comment" &&
        interaction.source_comment_id
      ) {
        await replyToComment(
          interaction.source_comment_id,
          interaction.drafted_response,
          token
        );
      } else if (interaction.instagram_user_id) {
        await sendDirectMessage(
          interaction.instagram_user_id,
          interaction.drafted_response,
          token
        );
      }
      await admin
        .from("interactions")
        .update({
          status: "approved",
          final_response: interaction.drafted_response,
          responded_at: new Date().toISOString(),
        })
        .eq("id", interaction.id);
      approved++;
    } catch (err) {
      await admin
        .from("interactions")
        .update({
          status: "failed",
          error_message: String(err),
        })
        .eq("id", interaction.id);
    }
  }

  return Response.json({ ok: true, approved });
}
