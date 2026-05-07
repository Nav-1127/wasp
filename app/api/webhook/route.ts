// app/api/webhook/route.ts
// Meta Instagram Webhook endpoint.
//
// Setup in Meta developer dashboard:
//   Webhook URL:   https://joinwasp.com/api/webhook
//   Verify token:  WEBHOOK_VERIFY_TOKEN env var (any random string)
//   Subscriptions: comments, messages
//
// GET  — Meta webhook verification handshake (returns hub.challenge)
// POST — Incoming event (comment / DM / story reply)
//         Signature is verified via HMAC-SHA256 with META_APP_SECRET.
//         Events are published to QStash for async processing and we return
//         200 to Meta immediately. Falls back to inline after() processing
//         when QStash is not configured (local dev).

import { NextRequest } from "next/server";
import { after } from "next/server";
import { createHmac } from "crypto";
import { publishJob, isQStashEnabled } from "@/lib/job-queue";
import { processComment, processDM } from "@/lib/agent";
import { createAdminClient } from "@/lib/supabase";

const isMockMode =
  !process.env.META_APP_ID || process.env.USE_MOCK_AUTH === "true";

// ── GET — Meta webhook verification ───────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode      = searchParams.get("hub.mode");
  const token     = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log("[webhook] Meta verification OK");
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

// ── POST — incoming Instagram event ───────────────────────────────────────────

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Verify HMAC-SHA256 signature (skip in mock/dev mode)
  if (!isMockMode) {
    const signature = request.headers.get("x-hub-signature-256") ?? "";
    if (!verifySignature(rawBody, signature)) {
      console.warn("[webhook] Invalid signature — rejecting request");
      return new Response("Unauthorized", { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  if (body.object !== "instagram") {
    return Response.json({ ok: true });
  }

  if (isQStashEnabled()) {
    // QStash path: parse events, look up brand account IDs, publish jobs.
    // Returns 200 to Meta immediately — QStash handles retry and processing.
    await publishWebhookEvents(body);
  } else {
    // Fallback (local dev / QStash not configured): process inline via after()
    // so Meta still gets its 200 immediately.
    after(async () => {
      await processWebhookBodyInline(body);
    });
  }

  return Response.json({ ok: true });
}

// ── QStash path ────────────────────────────────────────────────────────────────

async function publishWebhookEvents(body: Record<string, unknown>): Promise<void> {
  const entries = body.entry as Array<Record<string, unknown>> | undefined;
  if (!entries) return;

  const admin = createAdminClient();

  for (const entry of entries) {
    const instagramUserId = entry.id as string;

    // Resolve brand account ID once per entry (one Instagram account per entry)
    const { data: account } = await admin
      .from("brand_accounts")
      .select("id")
      .eq("instagram_user_id", instagramUserId)
      .single();

    if (!account) {
      console.log("[webhook] No account found for instagram_user_id:", instagramUserId);
      continue;
    }

    const brandAccountId = account.id as string;

    const changes = entry.changes as
      | Array<{ field: string; value: Record<string, unknown> }>
      | undefined;

    if (changes) {
      for (const change of changes) {
        if (change.field === "comments") {
          await publishJob(brandAccountId, {
            jobType: "comment",
            data: {
              instagram_user_id:   instagramUserId,
              comment_id:         (change.value.id as string) ?? "",
              commenter_id:       (change.value.from as Record<string, string>)?.id ?? "",
              commenter_username: (change.value.from as Record<string, string>)?.username ?? "",
              comment_text:       (change.value.text as string) ?? "",
              post_id:            (change.value.media as Record<string, string>)?.id ?? "",
              timestamp:          (change.value.timestamp as string) ?? new Date().toISOString(),
            },
          });
        } else if (change.field === "messages") {
          await publishMessageJob(brandAccountId, instagramUserId, change.value);
        }
      }
    }

    // Some webhook versions deliver messages under entry.messaging
    const messaging = entry.messaging as Array<Record<string, unknown>> | undefined;
    if (messaging) {
      for (const msg of messaging) {
        await publishMessageJob(brandAccountId, instagramUserId, msg);
      }
    }
  }
}

async function publishMessageJob(
  brandAccountId: string,
  instagramUserId: string,
  value: Record<string, unknown>
): Promise<void> {
  const storyReply = value.reply_to as { story?: { id: string } } | undefined;

  await publishJob(brandAccountId, {
    jobType: "dm",
    data: {
      instagram_user_id: instagramUserId,
      sender_id:        (value.sender as Record<string, string>)?.id ?? "",
      sender_username:  (value.sender as Record<string, string>)?.username,
      message_text:     (value.message as Record<string, string>)?.text ?? "",
      timestamp:        (value.timestamp as string) ?? new Date().toISOString(),
      is_story_reply:   !!storyReply?.story,
      story_id:         storyReply?.story?.id,
    },
  });
}

// ── Inline fallback path (dev only) ───────────────────────────────────────────

async function processWebhookBodyInline(body: Record<string, unknown>): Promise<void> {
  const entries = body.entry as Array<Record<string, unknown>> | undefined;
  if (!entries) return;

  for (const entry of entries) {
    const changes = entry.changes as
      | Array<{ field: string; value: Record<string, unknown> }>
      | undefined;

    if (changes) {
      for (const change of changes) {
        if (change.field === "comments") {
          try {
            await processComment({
              instagram_user_id:   entry.id as string,
              comment_id:         (change.value.id as string) ?? "",
              commenter_id:       (change.value.from as Record<string, string>)?.id ?? "",
              commenter_username: (change.value.from as Record<string, string>)?.username ?? "",
              comment_text:       (change.value.text as string) ?? "",
              post_id:            (change.value.media as Record<string, string>)?.id ?? "",
              timestamp:          (change.value.timestamp as string) ?? new Date().toISOString(),
            });
          } catch (err) {
            console.error("[webhook] handleComment error:", err);
          }
        } else if (change.field === "messages") {
          try {
            await processMessageInline(entry.id as string, change.value);
          } catch (err) {
            console.error("[webhook] handleMessage error:", err);
          }
        }
      }
    }

    const messaging = entry.messaging as Array<Record<string, unknown>> | undefined;
    if (messaging) {
      for (const msg of messaging) {
        try {
          await processMessageInline(entry.id as string, msg);
        } catch (err) {
          console.error("[webhook] handleMessage error:", err);
        }
      }
    }
  }
}

async function processMessageInline(
  instagramUserId: string,
  value: Record<string, unknown>
): Promise<void> {
  const storyReply = value.reply_to as { story?: { id: string } } | undefined;
  await processDM({
    instagram_user_id: instagramUserId,
    sender_id:        (value.sender as Record<string, string>)?.id ?? "",
    sender_username:  (value.sender as Record<string, string>)?.username,
    message_text:     (value.message as Record<string, string>)?.text ?? "",
    timestamp:        (value.timestamp as string) ?? new Date().toISOString(),
    is_story_reply:   !!storyReply?.story,
    story_id:         storyReply?.story?.id,
  });
}

// ── HMAC verification ──────────────────────────────────────────────────────────

function verifySignature(rawBody: string, signature: string): boolean {
  if (!process.env.META_APP_SECRET) return false;
  const expected = `sha256=${createHmac("sha256", process.env.META_APP_SECRET)
    .update(rawBody)
    .digest("hex")}`;
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}
