// app/api/process-job/route.ts
// QStash delivery endpoint — receives jobs from the brand queues and executes them.
//
// Job types handled:
//   comment — run full agent pipeline for an incoming Instagram comment
//   dm      — run full agent pipeline for an incoming DM or story reply
//   send    — dispatch an already-drafted reply after a human reply delay
//
// Security: every incoming request must carry a valid QStash signature.
// Requests without a valid signature are rejected with 401.
// Signature verification is skipped when signing keys are not configured
// (local dev without Upstash set up).

import { NextRequest } from "next/server";
import { createReceiver, type QStashJob } from "@/lib/job-queue";
import { processComment, processDM } from "@/lib/agent";
import { createAdminClient } from "@/lib/supabase";
import { replyToComment, sendDirectMessage, decryptToken } from "@/lib/instagram";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // ── Verify QStash signature ────────────────────────────────────────────────
  // Skip verification when signing keys are not configured (local dev).
  if (
    process.env.QSTASH_CURRENT_SIGNING_KEY &&
    process.env.QSTASH_NEXT_SIGNING_KEY
  ) {
    const signature = request.headers.get("upstash-signature") ?? "";
    try {
      const receiver = createReceiver();
      await receiver.verify({ signature, body: rawBody, clockTolerance: 5 });
    } catch (err) {
      console.error("[process-job] Invalid QStash signature:", err);
      return new Response("Unauthorized", { status: 401 });
    }
  }

  // ── Parse job payload ──────────────────────────────────────────────────────
  let job: QStashJob;
  try {
    job = JSON.parse(rawBody) as QStashJob;
  } catch {
    console.error("[process-job] Invalid JSON payload");
    return new Response("Bad Request", { status: 400 });
  }

  // ── Dispatch ───────────────────────────────────────────────────────────────
  try {
    switch (job.jobType) {
      case "comment":
        await processComment(job.data);
        break;

      case "dm":
        await processDM(job.data);
        break;

      case "send":
        await executeSend(job.interactionId);
        break;

      default:
        console.error("[process-job] Unknown job type:", (job as QStashJob & { jobType: string }).jobType);
        return new Response("Bad Request", { status: 400 });
    }
  } catch (err) {
    console.error("[process-job] Job execution failed:", err);
    // Return 500 so QStash retries the job (up to the configured retry limit)
    return new Response("Internal Server Error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}

// ── executeSend ────────────────────────────────────────────────────────────────
//
// Sends an already-drafted reply for an interaction whose human reply delay
// has elapsed. Called via a QStash delayed job published by agent.ts when
// delaySecs > 0 — replaces the old processScheduled() DB-polling approach.

async function executeSend(interactionId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: interaction } = await admin
    .from("interactions")
    .select("*")
    .eq("id", interactionId)
    .single();

  if (!interaction) {
    console.warn(`[process-job] executeSend: interaction ${interactionId} not found`);
    return;
  }

  // Guard: only send if still in scheduled state — prevents double-sends
  // if a human approved/sent it manually before the delay elapsed.
  if (interaction.status !== "scheduled") {
    console.log(`[process-job] executeSend: interaction ${interactionId} already handled (status: ${interaction.status})`);
    return;
  }

  const response = interaction.drafted_response;
  if (!response) {
    console.warn(`[process-job] executeSend: no drafted_response for ${interactionId}`);
    return;
  }

  const { data: account } = await admin
    .from("brand_accounts")
    .select("*")
    .eq("id", interaction.brand_account_id)
    .single();

  if (!account?.instagram_access_token_encrypted) {
    console.warn(`[process-job] executeSend: no token for brand account ${interaction.brand_account_id}`);
    return;
  }

  const token = decryptToken(account.instagram_access_token_encrypted);
  const routing: string = interaction.routing_decision ?? "public";

  try {
    if (
      routing === "both" &&
      interaction.interaction_type === "comment" &&
      interaction.source_comment_id
    ) {
      const ack = interaction.public_acknowledgement ?? "I've sent you a DM with the details!";
      await replyToComment(interaction.source_comment_id, ack, token);
      await sendDirectMessage(interaction.instagram_user_id, response, token);
    } else if (
      interaction.interaction_type === "comment" &&
      interaction.source_comment_id
    ) {
      await replyToComment(interaction.source_comment_id, response, token);
    } else {
      await sendDirectMessage(interaction.instagram_user_id, response, token);
    }

    await admin
      .from("interactions")
      .update({
        status: "auto_sent",
        final_response: response,
        responded_at: new Date().toISOString(),
        scheduled_send_at: null,
      })
      .eq("id", interactionId);
  } catch (err) {
    console.error(`[process-job] executeSend failed for ${interactionId}:`, err);
    await admin
      .from("interactions")
      .update({ status: "failed", error_message: String(err) })
      .eq("id", interactionId);
    throw err; // rethrow so QStash retries
  }
}
