// Instagram Webhook — receives real-time comment and DM events from Meta
//
// Setup required in Meta developer dashboard:
//   Webhook URL:    https://joinwasp.com/api/webhooks/instagram
//   Verify token:  set WEBHOOK_VERIFY_TOKEN env var (any random string)
//   Subscriptions: comments, messages
//
// Processing order:
//   1. Check Sting Triggers (keyword or smart_intent) — takes priority
//   2. If no trigger matched, classify comment and apply engagement_level rules
//   3. Draft AI response (Phase 3)

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────────

type CommentCategory =
  | "question"
  | "compliment"
  | "feedback"
  | "purchase_intent"
  | "hype_emoji"
  | "friend_tag"
  | "spam"
  | "other";

interface IncomingComment {
  instagram_user_id: string; // the account that was commented on
  comment_id: string;
  commenter_id: string;
  commenter_username: string;
  comment_text: string;
  post_id: string;
  timestamp: string;
}

// ── GET — Meta webhook verification handshake ──────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode      = searchParams.get("hub.mode");
  const token     = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.WEBHOOK_VERIFY_TOKEN
  ) {
    console.log("Webhook verified by Meta");
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

// ── POST — incoming comment / DM event ────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Instagram webhook received:", JSON.stringify(body, null, 2));

    // Meta sends a top-level { object: "instagram", entry: [...] }
    if (body.object !== "instagram") {
      return Response.json({ ok: true });
    }

    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field === "comments") {
          await handleComment({
            instagram_user_id: entry.id,
            comment_id:        change.value.id,
            commenter_id:      change.value.from?.id ?? "",
            commenter_username: change.value.from?.username ?? "",
            comment_text:      change.value.text ?? "",
            post_id:           change.value.media?.id ?? "",
            timestamp:         change.value.timestamp ?? new Date().toISOString(),
          });
        }
        // DMs and story replies — always respond (high intent)
        if (change.field === "messages") {
          await handleDirectMessage(entry.id, change.value);
        }
      }
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return Response.json({ error: "Processing failed" }, { status: 500 });
  }
}

// ── Comment handler ────────────────────────────────────────────────────────────

async function handleComment(comment: IncomingComment) {
  const admin = createAdminClient();

  // 1. Look up the brand account by instagram_user_id
  const { data: account } = await admin
    .from("brand_accounts")
    .select("id, user_id, engagement_level, personality_prompt")
    .eq("instagram_user_id", comment.instagram_user_id)
    .single();

  if (!account) {
    console.log("No account found for instagram_user_id:", comment.instagram_user_id);
    return;
  }

  // 2. Check Sting Triggers first (they take priority over normal AI responses)
  const matchedTrigger = await matchStingTrigger(
    account.id,
    comment.comment_text,
    comment.post_id
  );

  if (matchedTrigger) {
    console.log(`Sting trigger matched: ${matchedTrigger.name}`);

    // Log the interaction
    await admin.from("interactions").insert({
      brand_account_id:  account.id,
      user_id:           account.user_id,
      interaction_type:  "comment",
      platform_id:       comment.comment_id,
      commenter_id:      comment.commenter_id,
      commenter_username: comment.commenter_username,
      content:           comment.comment_text,
      draft_response:    matchedTrigger.comment_reply,
      status:            "queued", // Phase 3 will send these automatically
      sting_trigger_id:  matchedTrigger.id,
    });

    // Increment the trigger's fired counter
    await admin
      .from("sting_triggers")
      .update({ times_triggered: (matchedTrigger.times_triggered ?? 0) + 1 })
      .eq("id", matchedTrigger.id);

    return;
  }

  // 3. No sting trigger — classify the comment and apply engagement_level
  const category = classifyComment(comment.comment_text);
  const shouldRespond = decideByEngagementLevel(
    account.engagement_level ?? "smart_select",
    category
  );

  if (!shouldRespond) {
    console.log(`Skipping comment (${category}) — engagement level: ${account.engagement_level}`);
    return;
  }

  // 4. Log as pending — Phase 3 will generate the AI draft
  await admin.from("interactions").insert({
    brand_account_id:   account.id,
    user_id:            account.user_id,
    interaction_type:   "comment",
    platform_id:        comment.comment_id,
    commenter_id:       comment.commenter_id,
    commenter_username: comment.commenter_username,
    content:            comment.comment_text,
    comment_category:   category,
    status:             "pending_draft",
  });

  console.log(`Comment queued for AI response (${category})`);
}

// ── DM handler ─────────────────────────────────────────────────────────────────

async function handleDirectMessage(
  instagramUserId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messageValue: any
) {
  const admin = createAdminClient();

  const { data: account } = await admin
    .from("brand_accounts")
    .select("id, user_id")
    .eq("instagram_user_id", instagramUserId)
    .single();

  if (!account) return;

  // DMs always get a response — log as pending_draft for Phase 3
  await admin.from("interactions").insert({
    brand_account_id:   account.id,
    user_id:            account.user_id,
    interaction_type:   "dm",
    platform_id:        messageValue.mid ?? "",
    commenter_id:       messageValue.sender?.id ?? "",
    commenter_username: "",
    content:            messageValue.message?.text ?? "",
    status:             "pending_draft",
  });
}

// ── Sting trigger matching ─────────────────────────────────────────────────────

async function matchStingTrigger(
  brandAccountId: string,
  commentText: string,
  postId: string
) {
  const admin = createAdminClient();

  const { data: triggers } = await admin
    .from("sting_triggers")
    .select("*")
    .eq("brand_account_id", brandAccountId)
    .eq("is_active", true);

  if (!triggers || triggers.length === 0) return null;

  const lowerComment = commentText.toLowerCase();

  for (const trigger of triggers) {
    // Check post scope
    if (
      trigger.applies_to === "specific_posts" &&
      !trigger.specific_post_ids?.includes(postId)
    ) {
      continue;
    }

    if (trigger.trigger_type === "keyword") {
      // Keyword match — case-insensitive, any keyword present in comment
      const keywords: string[] = trigger.trigger_keywords ?? [];
      const matched = keywords.some((kw: string) =>
        lowerComment.includes(kw.toLowerCase())
      );
      if (matched) return trigger;
    }

    if (trigger.trigger_type === "smart_intent") {
      // Smart intent — Phase 3 will call Claude here.
      // For now, log as unhandled; this is a placeholder.
      console.log(
        `Smart intent trigger "${trigger.name}" detected — AI classification pending Phase 3`
      );
    }
  }

  return null;
}

// ── Comment classifier ─────────────────────────────────────────────────────────
// Phase 3 will replace this with a Claude API call.
// For now, uses simple heuristics.

function classifyComment(text: string): CommentCategory {
  const lower = text.toLowerCase().trim();

  // Single emoji / very short hype comments
  if (lower.length <= 3) return "hype_emoji";

  // Common hype patterns
  if (/^(🔥+|💯+|❤️+|😍+|👏+|🙌+)+$/.test(lower)) return "hype_emoji";
  if (/^(fire|goat|based|slay|facts|w+|lol+|haha+)$/.test(lower)) return "hype_emoji";

  // Friend tag pattern: @username (and little else)
  if (/^@\w+(\s+@\w+)*\s*[!]*$/.test(lower)) return "friend_tag";

  // Questions
  if (/\?/.test(lower)) return "question";
  if (/^(how|what|when|where|why|who|can you|do you|is this|are these|does this)/.test(lower)) return "question";

  // Purchase intent
  if (/(buy|purchase|price|cost|how much|order|get this|link|shop|available)/.test(lower)) return "purchase_intent";

  // Compliments
  if (/(love|amazing|beautiful|gorgeous|awesome|great|excellent|fantastic|wonderful|perfect|obsessed)/.test(lower)) return "compliment";

  // Spam signals
  if (/(follow back|check my page|dm me|promo|collab|free followers|click my link)/.test(lower)) return "spam";

  // Feedback
  if (/(suggest|recommend|should|could|would be better|improve|feedback)/.test(lower)) return "feedback";

  return "other";
}

// ── Engagement level gate ──────────────────────────────────────────────────────

function decideByEngagementLevel(
  level: string,
  category: CommentCategory
): boolean {
  switch (level) {
    case "reply_all":
      return true;

    case "smart_select":
      // Reply to high-value comments only; skip low-effort noise
      return !["hype_emoji", "friend_tag", "spam"].includes(category);

    case "questions_only":
      return category === "question";

    case "manual_pick":
      // Draft for all but let user choose — we queue everything
      return true;

    default:
      return true;
  }
}
