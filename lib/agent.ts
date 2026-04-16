// lib/agent.ts
// AI Agent Processing Pipeline — the core engine that makes WASP work.
//
// Pipeline steps (comments):
//   A — Sting trigger check (keyword or smart_intent via Claude Haiku)
//   B — Engagement level filter (reply_all / smart_select / questions_only / manual_pick)
//   C — Build context (system prompt from personality + objective + products + assets)
//   D — Generate response (Claude Haiku 4.5, max 150 tokens)
//   E — Route based on mode (draft → pending for human approval; auto → send immediately)
//
// DMs also run Step F: update conversation_threads with the new exchange.
//
// All functions return the interaction ID on success, or null on failure.

import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase";
import {
  buildAgentSystemPrompt,
  type InteractionType,
  type PromptProduct,
  type PromptAsset,
} from "@/lib/prompts";
import {
  replyToComment,
  sendDirectMessage,
  getPostInfo,
  decryptToken,
} from "@/lib/instagram";
import { checkRateLimit, drainQueue } from "@/lib/queue";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface WebhookComment {
  instagram_user_id: string;   // the brand's IG account that received the comment
  comment_id: string;          // Instagram comment ID
  commenter_id: string;        // the person who commented
  commenter_username: string;
  comment_text: string;
  post_id: string;
  timestamp: string;
}

export interface WebhookDM {
  instagram_user_id: string;   // the brand's IG account that received the DM
  sender_id: string;
  sender_username?: string;
  message_text: string;
  timestamp: string;
  is_story_reply?: boolean;
  story_id?: string;           // the story that was replied to, if known
}

type CommentCategory =
  | "question"
  | "compliment"
  | "meaningful_feedback"
  | "purchase_intent"
  | "hype_emoji"
  | "friend_tag"
  | "spam"
  | "other";

// ── Claude client ──────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const isMockMode =
  !process.env.META_APP_ID || process.env.USE_MOCK_AUTH === "true";

// ── Step A helpers ─────────────────────────────────────────────────────────────

/**
 * Classify whether a comment matches a smart_intent trigger description.
 * Uses Claude Haiku for speed. Returns true if the comment matches.
 */
async function classifySmartIntent(
  commentText: string,
  triggerDescription: string
): Promise<boolean> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 10,
      messages: [
        {
          role: "user",
          content:
            `Does this Instagram comment match the following intent? Answer only YES or NO.\n\n` +
            `Intent: ${triggerDescription}\n\n` +
            `Comment: "${commentText}"`,
        },
      ],
    });
    const text =
      response.content.find((b) => b.type === "text")?.text?.toUpperCase() ??
      "";
    return text.includes("YES");
  } catch (err) {
    console.error("Smart intent classification error:", err);
    return false; // safe default: don't fire the trigger on error
  }
}

// ── Step B helpers ─────────────────────────────────────────────────────────────

/** Classify an Instagram comment using Claude Haiku. Falls back to heuristics on error. */
async function classifyComment(text: string): Promise<CommentCategory> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 20,
      messages: [
        {
          role: "user",
          content:
            `Classify this Instagram comment into exactly one category. Reply with ONLY the category name, nothing else.\n\n` +
            `Categories: question, compliment, meaningful_feedback, purchase_intent, hype_emoji, friend_tag, spam, other\n\n` +
            `Comment: "${text}"\n\n` +
            `Category:`,
        },
      ],
    });
    const result =
      response.content
        .find((b) => b.type === "text")
        ?.text?.toLowerCase()
        .trim() ?? "other";
    const valid: CommentCategory[] = [
      "question",
      "compliment",
      "meaningful_feedback",
      "purchase_intent",
      "hype_emoji",
      "friend_tag",
      "spam",
    ];
    return valid.find((c) => result.includes(c)) ?? "other";
  } catch {
    return heuristicClassify(text);
  }
}

function heuristicClassify(text: string): CommentCategory {
  const lower = text.toLowerCase().trim();
  if (lower.length <= 3) return "hype_emoji";
  if (/^@\w+(\s+@\w+)*\s*[!?]*$/.test(lower)) return "friend_tag";
  if (/\?/.test(lower)) return "question";
  if (
    /(buy|purchase|price|cost|how much|order|get this|link|shop|where can i|available)/i.test(
      text
    )
  )
    return "purchase_intent";
  if (
    /(love|amazing|beautiful|gorgeous|awesome|great|excellent|wonderful|perfect|obsessed|incredible)/i.test(
      text
    )
  )
    return "compliment";
  if (/(follow back|check my page|dm me|promo|collab|free followers)/i.test(text))
    return "spam";
  if (/(suggest|recommend|should|could|would be better|improve|feedback)/i.test(text))
    return "meaningful_feedback";
  return "other";
}

function shouldRespondByEngagementLevel(
  level: string,
  category: CommentCategory
): boolean {
  switch (level) {
    case "reply_all":
      return true;
    case "smart_select":
      return ["question", "compliment", "meaningful_feedback", "purchase_intent"].includes(
        category
      );
    case "questions_only":
      return category === "question";
    case "manual_pick":
      return true; // respond to everything, but force pending regardless of mode
    default:
      return true;
  }
}

// ── Step D ─────────────────────────────────────────────────────────────────────

/** Generate a response using Claude Haiku 4.5. Returns null if the API fails. */
async function generateResponse(
  systemPrompt: string,
  userMessage: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [],
  imageUrl?: string | null
): Promise<string | null> {
  try {
    // Build the current user turn — multimodal if we have a post image
    type ContentBlock =
      | { type: "text"; text: string }
      | { type: "image"; source: { type: "url"; url: string } };

    const currentContent: ContentBlock[] = imageUrl
      ? [
          { type: "image", source: { type: "url", url: imageUrl } },
          { type: "text", text: userMessage },
        ]
      : [{ type: "text", text: userMessage }];

    // History messages are always plain text; only the live turn includes the image
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messages: any[] = [
      ...conversationHistory,
      { role: "user", content: currentContent },
    ];

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      system: systemPrompt,
      messages,
    });

    return response.content.find((b) => b.type === "text")?.text ?? null;
  } catch (err) {
    console.error("Claude API error in generateResponse:", err);
    return null;
  }
}

// ── processComment ─────────────────────────────────────────────────────────────

/**
 * Run the full agent pipeline for an incoming comment.
 * Returns the interaction ID that was saved, or null if no action was taken.
 */
export async function processComment(
  comment: WebhookComment
): Promise<string | null> {
  const admin = createAdminClient();

  // ── Look up brand account ───────────────────────────────────────────────────
  const { data: account } = await admin
    .from("brand_accounts")
    .select("*")
    .eq("instagram_user_id", comment.instagram_user_id)
    .single();

  if (!account) {
    console.log(
      "processComment: no account found for instagram_user_id",
      comment.instagram_user_id
    );
    return null;
  }

  // Drain any queued messages while we have the account (uses capacity before new sends)
  if (!isMockMode && account.instagram_access_token_encrypted) {
    try {
      const token = decryptToken(account.instagram_access_token_encrypted);
      await drainQueue(account.id, token);
    } catch {
      // Non-fatal — continue with main processing
    }
  }

  // ── Step A: Sting trigger check ─────────────────────────────────────────────
  const { data: triggers } = await admin
    .from("sting_triggers")
    .select("*")
    .eq("brand_account_id", account.id)
    .eq("is_active", true);

  if (triggers && triggers.length > 0) {
    const lowerComment = comment.comment_text.toLowerCase();

    for (const trigger of triggers) {
      // Scope check — skip if trigger is limited to specific posts this one isn't in
      if (
        trigger.applies_to === "specific_posts" &&
        !trigger.specific_post_ids?.includes(comment.post_id)
      ) {
        continue;
      }

      let matched = false;
      if (trigger.trigger_type === "keyword") {
        const keywords: string[] = trigger.trigger_keywords ?? [];
        matched = keywords.some((kw: string) =>
          lowerComment.includes(kw.toLowerCase())
        );
      } else if (trigger.trigger_type === "smart_intent") {
        matched = await classifySmartIntent(
          comment.comment_text,
          trigger.trigger_description ?? ""
        );
      }

      if (matched) {
        const dmFull = trigger.dm_link
          ? `${trigger.dm_message}\n${trigger.dm_link}`
          : trigger.dm_message;

        // Save interaction record
        const { data: interaction } = await admin
          .from("interactions")
          .insert({
            brand_account_id: account.id,
            user_id: account.user_id,
            interaction_type: "comment",
            source_post_id: comment.post_id,
            source_comment_id: comment.comment_id,
            instagram_user_id: comment.commenter_id,
            instagram_username: comment.commenter_username,
            message_text: comment.comment_text,
            drafted_response: trigger.comment_reply,
            status: "pending",
            sting_trigger_id: trigger.id,
          })
          .select("id")
          .single();

        // Send immediately unless in mock mode
        if (!isMockMode && account.instagram_access_token_encrypted) {
          const token = decryptToken(account.instagram_access_token_encrypted);
          try {
            await replyToComment(comment.comment_id, trigger.comment_reply, token);
            await sendDirectMessage(comment.commenter_id, dmFull, token);
            if (interaction) {
              await admin
                .from("interactions")
                .update({
                  status: "auto_sent",
                  final_response: trigger.comment_reply,
                  responded_at: new Date().toISOString(),
                })
                .eq("id", interaction.id);
            }
          } catch (err) {
            console.error("Sting trigger send failed:", err);
            if (interaction) {
              await admin
                .from("interactions")
                .update({ status: "failed", error_message: String(err) })
                .eq("id", interaction.id);
            }
          }
        }

        // Increment times_triggered
        await admin
          .from("sting_triggers")
          .update({ times_triggered: (trigger.times_triggered ?? 0) + 1 })
          .eq("id", trigger.id);

        return interaction?.id ?? null; // skip remaining steps
      }
    }
  }

  // ── Step B: Engagement level filter ────────────────────────────────────────
  const engagementLevel = account.engagement_level ?? "smart_select";
  const forcePending = engagementLevel === "manual_pick";

  let category: CommentCategory = "other";

  if (engagementLevel === "smart_select" || engagementLevel === "questions_only") {
    category = await classifyComment(comment.comment_text);
  }

  const shouldProceed = shouldRespondByEngagementLevel(engagementLevel, category);
  if (!shouldProceed) {
    console.log(
      `Skipping comment (${category}) — engagement_level: ${engagementLevel}`
    );
    return null;
  }

  // ── Step C: Build context ───────────────────────────────────────────────────
  const [productsRes, assetsRes, postInfo] = await Promise.all([
    admin
      .from("products")
      .select("name, description, price_range, url")
      .eq("brand_account_id", account.id),
    admin
      .from("account_assets")
      .select("label, url, when_to_share")
      .eq("brand_account_id", account.id),
    !isMockMode && account.instagram_access_token_encrypted
      ? getPostInfo(
          comment.post_id,
          decryptToken(account.instagram_access_token_encrypted)
        ).catch(() => null)
      : Promise.resolve(null),
  ]);

  const systemPrompt = buildAgentSystemPrompt({
    personalityPrompt: account.personality_prompt ?? "",
    primaryObjective: account.primary_objective ?? "grow_engagement",
    products: (productsRes.data as PromptProduct[]) ?? [],
    assets: (assetsRes.data as PromptAsset[]) ?? [],
    interactionType: "comment",
    postContext: postInfo?.caption ?? null,
  });

  // ── Step D: Generate response ───────────────────────────────────────────────
  // Pass the post thumbnail so Claude can see the actual image, not just the caption.
  const draftResponse = await generateResponse(
    systemPrompt,
    comment.comment_text,
    [],
    postInfo?.thumbnail_url ?? null
  );

  // ── Save interaction ────────────────────────────────────────────────────────
  const { data: interaction, error: insertError } = await admin
    .from("interactions")
    .insert({
      brand_account_id: account.id,
      user_id: account.user_id,
      interaction_type: "comment",
      source_post_id: comment.post_id,
      source_post_thumbnail: postInfo?.thumbnail_url ?? null,
      source_comment_id: comment.comment_id,
      instagram_user_id: comment.commenter_id,
      instagram_username: comment.commenter_username,
      message_text: comment.comment_text,
      drafted_response: draftResponse,
      comment_category: category,
      status: "pending",
      error_message: draftResponse
        ? null
        : "Claude API failed to generate a response",
    })
    .select("id")
    .single();

  if (insertError || !interaction) {
    console.error("Failed to save comment interaction:", insertError);
    return null;
  }

  // ── Step E: Route based on mode ─────────────────────────────────────────────
  const effectiveMode =
    forcePending
      ? "draft"
      : (account.comment_mode ?? account.agent_mode ?? "draft");

  if (
    effectiveMode === "auto" &&
    draftResponse &&
    !isMockMode &&
    account.instagram_access_token_encrypted
  ) {
    const underLimit = await checkRateLimit(account.id);
    if (!underLimit) {
      await admin
        .from("interactions")
        .update({ status: "queued" })
        .eq("id", interaction.id);
      return interaction.id;
    }

    const token = decryptToken(account.instagram_access_token_encrypted);
    try {
      await replyToComment(comment.comment_id, draftResponse, token);
      await admin
        .from("interactions")
        .update({
          status: "auto_sent",
          final_response: draftResponse,
          responded_at: new Date().toISOString(),
        })
        .eq("id", interaction.id);
    } catch (err) {
      console.error("Auto comment reply failed:", err);
      await admin
        .from("interactions")
        .update({ status: "failed", error_message: String(err) })
        .eq("id", interaction.id);
    }
  }
  // Draft mode: keep status as 'pending' for human approval in the dashboard

  return interaction.id;
}

// ── processDM ──────────────────────────────────────────────────────────────────

/**
 * Run the full agent pipeline for an incoming DM or story reply.
 * Returns the interaction ID that was saved, or null on failure.
 */
export async function processDM(dm: WebhookDM): Promise<string | null> {
  const admin = createAdminClient();
  const interactionType: InteractionType = dm.is_story_reply
    ? "story_reply"
    : "dm";

  // ── Look up brand account ───────────────────────────────────────────────────
  const { data: account } = await admin
    .from("brand_accounts")
    .select("*")
    .eq("instagram_user_id", dm.instagram_user_id)
    .single();

  if (!account) {
    console.log(
      "processDM: no account found for instagram_user_id",
      dm.instagram_user_id
    );
    return null;
  }

  // Drain queue while we have the account
  if (!isMockMode && account.instagram_access_token_encrypted) {
    try {
      const token = decryptToken(account.instagram_access_token_encrypted);
      await drainQueue(account.id, token);
    } catch {
      // Non-fatal
    }
  }

  // ── Step C: Build context ───────────────────────────────────────────────────

  // Fetch conversation history for DMs
  const { data: thread } = await admin
    .from("conversation_threads")
    .select("*")
    .eq("brand_account_id", account.id)
    .eq("instagram_user_id", dm.sender_id)
    .maybeSingle();

  // Build conversation history (last 10 turns)
  const storedMessages = (
    Array.isArray(thread?.messages) ? thread.messages : []
  ) as Array<{ role: "user" | "assistant"; content: string }>;
  const conversationHistory = storedMessages.slice(-10);

  const [productsRes, assetsRes] = await Promise.all([
    admin
      .from("products")
      .select("name, description, price_range, url")
      .eq("brand_account_id", account.id),
    admin
      .from("account_assets")
      .select("label, url, when_to_share")
      .eq("brand_account_id", account.id),
  ]);

  // Story context — fetch the story caption if this is a story reply
  let storyContext: string | null = null;
  if (
    dm.is_story_reply &&
    dm.story_id &&
    !isMockMode &&
    account.instagram_access_token_encrypted
  ) {
    const token = decryptToken(account.instagram_access_token_encrypted);
    const storyInfo = await getPostInfo(dm.story_id, token).catch(() => null);
    storyContext = storyInfo?.caption ?? null;
  }

  const systemPrompt = buildAgentSystemPrompt({
    personalityPrompt: account.personality_prompt ?? "",
    primaryObjective: account.primary_objective ?? "grow_engagement",
    products: (productsRes.data as PromptProduct[]) ?? [],
    assets: (assetsRes.data as PromptAsset[]) ?? [],
    interactionType,
    storyContext,
  });

  // ── Step D: Generate response ───────────────────────────────────────────────
  const draftResponse = await generateResponse(
    systemPrompt,
    dm.message_text,
    conversationHistory
  );

  // ── Save interaction ────────────────────────────────────────────────────────
  const { data: interaction, error: insertError } = await admin
    .from("interactions")
    .insert({
      brand_account_id: account.id,
      user_id: account.user_id,
      interaction_type: interactionType,
      instagram_user_id: dm.sender_id,
      instagram_username: dm.sender_username ?? "",
      message_text: dm.message_text,
      drafted_response: draftResponse,
      story_context: storyContext,
      status: "pending",
      error_message: draftResponse
        ? null
        : "Claude API failed to generate a response",
    })
    .select("id")
    .single();

  if (insertError || !interaction) {
    console.error("Failed to save DM interaction:", insertError);
    return null;
  }

  // ── Step E: Route based on mode ─────────────────────────────────────────────
  const effectiveMode =
    dm.is_story_reply
      ? (account.story_mode ?? account.agent_mode ?? "draft")
      : (account.dm_mode ?? account.agent_mode ?? "draft");

  if (
    effectiveMode === "auto" &&
    draftResponse &&
    !isMockMode &&
    account.instagram_access_token_encrypted
  ) {
    const underLimit = await checkRateLimit(account.id);
    if (!underLimit) {
      await admin
        .from("interactions")
        .update({ status: "queued" })
        .eq("id", interaction.id);
    } else {
      const token = decryptToken(account.instagram_access_token_encrypted);
      try {
        await sendDirectMessage(dm.sender_id, draftResponse, token);
        await admin
          .from("interactions")
          .update({
            status: "auto_sent",
            final_response: draftResponse,
            responded_at: new Date().toISOString(),
          })
          .eq("id", interaction.id);
      } catch (err) {
        console.error("Auto DM send failed:", err);
        await admin
          .from("interactions")
          .update({ status: "failed", error_message: String(err) })
          .eq("id", interaction.id);
      }
    }
  }

  // ── Step F: Store conversation thread ──────────────────────────────────────
  const newMessages = [
    ...storedMessages,
    {
      role: "user" as const,
      content: dm.message_text,
      timestamp: new Date().toISOString(),
    },
    ...(draftResponse
      ? [
          {
            role: "assistant" as const,
            content: draftResponse,
            timestamp: new Date().toISOString(),
          },
        ]
      : []),
  ];

  if (thread) {
    await admin
      .from("conversation_threads")
      .update({
        messages: newMessages,
        instagram_username: dm.sender_username ?? thread.instagram_username,
        updated_at: new Date().toISOString(),
      })
      .eq("id", thread.id);
  } else {
    await admin.from("conversation_threads").insert({
      brand_account_id: account.id,
      user_id: account.user_id,
      instagram_user_id: dm.sender_id,
      instagram_username: dm.sender_username ?? "",
      messages: newMessages,
    });
  }

  return interaction.id;
}
