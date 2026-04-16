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
//         Events are processed asynchronously via next/server `after()` so
//         we return 200 to Meta immediately and process in the background.

import { NextRequest } from "next/server";
import { after } from "next/server";
import { createHmac } from "crypto";
import { processComment, processDM } from "@/lib/agent";

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
  // Read raw body first (needed for HMAC verification)
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

  // Meta always sends { object: "instagram", entry: [...] }
  if (body.object !== "instagram") {
    return Response.json({ ok: true });
  }

  // Schedule async processing — return 200 to Meta immediately
  after(async () => {
    await processWebhookBody(body);
  });

  return Response.json({ ok: true });
}

// ── Processing ─────────────────────────────────────────────────────────────────

async function processWebhookBody(body: Record<string, unknown>) {
  const entries = body.entry as Array<Record<string, unknown>> | undefined;
  if (!entries) return;

  for (const entry of entries) {
    const changes = entry.changes as
      | Array<{ field: string; value: Record<string, unknown> }>
      | undefined;

    if (changes) {
      for (const change of changes) {
        if (change.field === "comments") {
          await handleComment(entry.id as string, change.value);
        } else if (change.field === "messages") {
          await handleMessage(entry.id as string, change.value);
        }
      }
    }

    // Messaging field arrives under entry.messaging for some webhook versions
    const messaging = entry.messaging as
      | Array<Record<string, unknown>>
      | undefined;
    if (messaging) {
      for (const msg of messaging) {
        await handleMessage(entry.id as string, msg);
      }
    }
  }
}

async function handleComment(
  instagramUserId: string,
  value: Record<string, unknown>
) {
  try {
    await processComment({
      instagram_user_id: instagramUserId,
      comment_id:        (value.id as string) ?? "",
      commenter_id:      (value.from as Record<string, string>)?.id ?? "",
      commenter_username:(value.from as Record<string, string>)?.username ?? "",
      comment_text:      (value.text as string) ?? "",
      post_id:           (value.media as Record<string, string>)?.id ?? "",
      timestamp:         (value.timestamp as string) ?? new Date().toISOString(),
    });
  } catch (err) {
    console.error("[webhook] handleComment error:", err);
  }
}

async function handleMessage(
  instagramUserId: string,
  value: Record<string, unknown>
) {
  try {
    const storyReply = value.reply_to as
      | { story?: { id: string } }
      | undefined;

    await processDM({
      instagram_user_id: instagramUserId,
      sender_id:        (value.sender as Record<string, string>)?.id ?? "",
      sender_username:  (value.sender as Record<string, string>)?.username,
      message_text:     (value.message as Record<string, string>)?.text ?? "",
      timestamp:        (value.timestamp as string) ?? new Date().toISOString(),
      is_story_reply:   !!storyReply?.story,
      story_id:         storyReply?.story?.id,
    });
  } catch (err) {
    console.error("[webhook] handleMessage error:", err);
  }
}

// ── HMAC verification ──────────────────────────────────────────────────────────

function verifySignature(rawBody: string, signature: string): boolean {
  if (!process.env.META_APP_SECRET) return false;
  const expected = `sha256=${createHmac("sha256", process.env.META_APP_SECRET)
    .update(rawBody)
    .digest("hex")}`;
  // Use timing-safe comparison
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}
