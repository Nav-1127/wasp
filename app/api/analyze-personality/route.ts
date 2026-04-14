// Content Personality Analysis
// Fetches the account's recent posts + comment replies, sends to Claude Sonnet 4.6,
// parses the structured response, and saves personality_profile + personality_prompt
// to brand_accounts.

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";
import { decrypt } from "@/lib/encryption";
import { getRecentPosts, getAccountCommentReplies } from "@/lib/instagram";

// ── Mock data (used when USE_MOCK_AUTH=true or META_APP_ID unset) ──────────────

const MOCK_POSTS = [
  { caption: "New drop just landed 🔥 been working on this colorway for 6 months. worth every second. link in bio #streetwear #newdrop #fashion", hashtags: ["#streetwear", "#newdrop", "#fashion"], timestamp: "2024-01-15T10:00:00Z" },
  { caption: "real talk — quality over quantity, every time. we don't do fast fashion around here 🙅‍♂️", hashtags: [], timestamp: "2024-01-12T10:00:00Z" },
  { caption: "pov: you finally found a brand that gets it 😭❤️ swipe to see what dropped this week", hashtags: [], timestamp: "2024-01-10T10:00:00Z" },
  { caption: "behind the scenes of the shoot today 📸 never a dull moment with this team fr fr", hashtags: [], timestamp: "2024-01-08T10:00:00Z" },
  { caption: "the hoodie you've been asking about is back. limited run. you know what to do 👀 #limited #restock", hashtags: ["#limited", "#restock"], timestamp: "2024-01-05T10:00:00Z" },
  { caption: "started from nothing, still building 🙏 grateful for every single one of you who rocks with us", hashtags: [], timestamp: "2024-01-03T10:00:00Z" },
  { caption: "collab incoming 👀 can't say more yet but you're not ready 😭🔥", hashtags: [], timestamp: "2024-01-01T10:00:00Z" },
  { caption: "these materials don't lie. heavyweight, structured, built to last. no shortcuts. #quality", hashtags: ["#quality"], timestamp: "2023-12-28T10:00:00Z" },
];

const MOCK_REPLIES = [
  "omg thank youuu that means everything to us 🙏🔥",
  "yes!! we're restocking next week, keep an eye on the bio link 👀",
  "haha we see you! drop is friday 🫶",
  "appreciate you fr fr, this comment made our day ❤️",
  "link in bio babe! sold in limited quantities so go fast 🏃‍♂️💨",
  "we hear you! more sizes dropping soon 🙌",
  "the realest comment we've seen today 😭❤️ thank you",
  "yes that colourway is coming back! stay tuned 🔥",
  "not gonna lie this comment is everything 😭 we appreciate you",
  "shipping starts tuesday! you'll get a tracking email 📦",
];

// ── POST — run analysis ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    // Load account
    const { data: account, error: accountError } = await admin
      .from("brand_accounts")
      .select("id, instagram_user_id, instagram_handle, instagram_access_token_encrypted")
      .eq("user_id", user.id)
      .single();

    if (accountError || !account) {
      return Response.json({ error: "Account not found" }, { status: 404 });
    }

    // Read body params (evolve/fresh overrides) before anything else
    let bodyJson: Record<string, string> = {};
    try { bodyJson = await request.json(); } catch { /* no body is fine */ }

    const evolvePrompt     = bodyJson.evolve_prompt?.trim() ?? "";
    const freshDescription = bodyJson.fresh_description?.trim() ?? "";

    const isMock =
      !process.env.META_APP_ID ||
      process.env.USE_MOCK_AUTH === "true" ||
      !account.instagram_access_token_encrypted ||
      account.instagram_access_token_encrypted === "mock_token_not_real";

    let posts: { caption: string; hashtags: string[]; timestamp: string }[];
    let replies: string[];
    let handle = account.instagram_handle ?? "your account";

    if (isMock) {
      posts   = MOCK_POSTS;
      replies = MOCK_REPLIES;
      handle  = account.instagram_handle ?? "your_instagram";
    } else {
      // Decrypt token and fetch real data
      const accessToken = decrypt(account.instagram_access_token_encrypted);
      const rawPosts    = await getRecentPosts(account.instagram_user_id, accessToken, 50);
      replies           = await getAccountCommentReplies(account.instagram_user_id, rawPosts, accessToken, 10);
      posts             = rawPosts.map((p) => ({
        caption:   p.caption ?? "",
        hashtags:  p.hashtags,
        timestamp: p.timestamp,
      }));
    }

    // Build the content string for Claude
    const captionBlock = posts
      .filter((p) => p.caption)
      .map((p, i) => `Post ${i + 1}: "${p.caption}"`)
      .join("\n");

    const repliesBlock = replies.length > 0
      ? replies.map((r, i) => `Reply ${i + 1}: "${r}"`).join("\n")
      : "No comment replies found.";

    const allHashtags = [...new Set(posts.flatMap((p) => p.hashtags))].join(", ");

    // ── Claude analysis prompt ─────────────────────────────────────────────────
    const prompt = freshDescription
      ? `A person describes their desired Instagram content personality as follows:

"${freshDescription}"

Based ONLY on this description (ignore any real Instagram data), generate a content personality profile. Return a JSON object (no markdown, just raw JSON) with EXACTLY this structure:

{
  "voice_summary": "2-3 sentence summary of the described voice and personality",
  "traits": {
    "formal_casual": <number 1-10>,
    "serious_playful": <number 1-10>,
    "reserved_bold": <number 1-10>,
    "minimal_expressive": <number 1-10>,
    "corporate_streetwise": <number 1-10>
  },
  "language_patterns": {
    "emoji_usage": "none" | "minimal" | "moderate" | "heavy",
    "emoji_types": [],
    "sentence_length": "very short" | "short" | "medium" | "long",
    "slang_level": "none" | "mild" | "moderate" | "heavy",
    "signature_phrases": [],
    "capitalization": "standard" | "lowercase" | "uppercase" | "mixed"
  },
  "engagement_style": {
    "to_compliments": "...",
    "to_product_questions": "...",
    "to_negative_comments": "...",
    "to_generic_comments": "..."
  },
  "content_themes": [],
  "sample_responses": {
    "to_compliment": "...",
    "to_product_question": "...",
    "to_negative_comment": "...",
    "to_hype_comment": "...",
    "to_purchase_confirmation": "..."
  }
}

Return ONLY the JSON.`
      : `You are analyzing the Instagram content personality of an account called @${handle}.${evolvePrompt ? `\n\nIMPORTANT: The user wants to evolve their personality in this direction: "${evolvePrompt}". Blend the content data below with this aspiration — lean toward the new direction while keeping authentic traits that align.` : ""}

Below are their recent post captions and their own comment replies to followers. Study the voice, tone, vocabulary, energy, and patterns carefully.

--- RECENT POST CAPTIONS ---
${captionBlock}

--- THEIR OWN COMMENT REPLIES ---
${repliesBlock}

--- HASHTAGS USED ---
${allHashtags || "None found"}

Analyze this content and return a JSON object (no markdown, just raw JSON) with EXACTLY this structure:

{
  "voice_summary": "2-3 sentence summary of their overall voice and personality",
  "traits": {
    "formal_casual": <number 1-10, where 1=very formal, 10=very casual>,
    "serious_playful": <number 1-10, where 1=very serious, 10=very playful>,
    "reserved_bold": <number 1-10, where 1=very reserved, 10=very bold>,
    "minimal_expressive": <number 1-10, where 1=very minimal, 10=very expressive>,
    "corporate_streetwise": <number 1-10, where 1=very corporate, 10=very streetwise>
  },
  "language_patterns": {
    "emoji_usage": "none" | "minimal" | "moderate" | "heavy",
    "emoji_types": ["list of emoji they typically use, or empty array"],
    "sentence_length": "very short" | "short" | "medium" | "long",
    "slang_level": "none" | "mild" | "moderate" | "heavy",
    "signature_phrases": ["up to 5 phrases or expressions they use frequently"],
    "capitalization": "standard" | "lowercase" | "uppercase" | "mixed"
  },
  "engagement_style": {
    "to_compliments": "1 sentence describing how they respond to compliments",
    "to_product_questions": "1 sentence describing how they respond to product or content questions",
    "to_negative_comments": "1 sentence describing how they handle negativity",
    "to_generic_comments": "1 sentence describing how they handle generic hype comments"
  },
  "content_themes": [
    { "theme": "theme name", "percentage": <number 0-100> }
  ],
  "sample_responses": {
    "to_compliment": "A response in their exact voice to: 'This is amazing, love your content!'",
    "to_product_question": "A response in their exact voice to: 'Where can I buy this / how do I get access?'",
    "to_negative_comment": "A response in their exact voice to: 'This is overpriced / not worth it'",
    "to_hype_comment": "A response in their exact voice to: '🔥🔥🔥'",
    "to_purchase_confirmation": "A response in their exact voice to: 'Just bought it / just subscribed!'"
  }
}

Be specific and accurate — base everything strictly on the actual content you see, not generic assumptions. The content_themes percentages should add up to 100. Return ONLY the JSON, nothing else.`;

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model:      "claude-sonnet-4-6",
      max_tokens: 2000,
      messages:   [{ role: "user", content: prompt }],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON — strip any accidental markdown fences
    const jsonStr = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const profile = JSON.parse(jsonStr);

    // ── Generate personality_prompt ────────────────────────────────────────────
    const t = profile.traits;
    const l = profile.language_patterns;
    const e = profile.engagement_style;

    const toneLabel     = t.formal_casual      >= 7 ? "casual and relaxed"   : t.formal_casual      <= 3 ? "formal and polished" : "balanced in tone";
    const playfulLabel  = t.serious_playful    >= 7 ? "playful and fun"       : t.serious_playful    <= 3 ? "serious and measured" : "a mix of serious and playful";
    const boldLabel     = t.reserved_bold      >= 7 ? "bold and direct"       : t.reserved_bold      <= 3 ? "reserved and thoughtful" : "confident but not overbearing";
    const expressLabel  = t.minimal_expressive >= 7 ? "expressive and emotive" : t.minimal_expressive <= 3 ? "minimal and understated" : "moderately expressive";
    const streetLabel   = t.corporate_streetwise >= 7 ? "street-savvy and culturally sharp" : t.corporate_streetwise <= 3 ? "professional and polished" : "authentic and approachable";

    const emojiNote = l.emoji_usage === "none"
      ? "You never use emojis."
      : l.emoji_usage === "minimal"
        ? `You use emojis sparingly${l.emoji_types?.length ? ` — typically ${l.emoji_types.slice(0, 3).join(" ")}` : ""}.`
        : l.emoji_usage === "moderate"
          ? `You use emojis naturally${l.emoji_types?.length ? ` — favourites include ${l.emoji_types.slice(0, 4).join(" ")}` : ""}.`
          : `You use emojis freely and often${l.emoji_types?.length ? ` — ${l.emoji_types.slice(0, 5).join(" ")} are regulars` : ""}.`;

    const sentenceNote = `Your sentences are ${l.sentence_length === "very short" ? "very short and punchy" : l.sentence_length === "short" ? "short and to the point" : l.sentence_length === "medium" ? "medium length" : "detailed and thorough"}.`;

    const phrasesNote = l.signature_phrases?.length
      ? `You often use phrases like: ${l.signature_phrases.map((p: string) => `"${p}"`).join(", ")}.`
      : "";

    const capsNote = l.capitalization === "lowercase"
      ? "You tend to write in lowercase."
      : l.capitalization === "uppercase"
        ? "You often write in uppercase for emphasis."
        : "";

    const personalityPrompt = `You are the Instagram voice of @${handle}. ${profile.voice_summary}

Your personality: you are ${toneLabel}, ${playfulLabel}, ${boldLabel}, ${expressLabel}, and ${streetLabel}.

${emojiNote} ${sentenceNote} ${phrasesNote} ${capsNote}

When someone compliments you: ${e.to_compliments}
When someone asks a product or content question: ${e.to_product_questions}
When someone is negative or critical: ${e.to_negative_comments}
When someone leaves a generic hype comment: ${e.to_generic_comments}

Keep every response to 1-3 sentences max. Sound like a real person — never robotic, never like a corporate brand account. Mirror the energy of the person commenting.`.trim();

    // ── Save to brand_accounts ─────────────────────────────────────────────────
    await admin
      .from("brand_accounts")
      .update({
        personality_profile: profile,
        personality_prompt:  personalityPrompt,
      })
      .eq("user_id", user.id);

    return Response.json({ profile, personality_prompt: personalityPrompt });

  } catch (err) {
    console.error("Personality analysis error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
