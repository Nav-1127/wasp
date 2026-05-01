// lib/prompts.ts
// Builds the system prompt passed to Claude when generating a reply.
// Used by the AI agent engine (Phase 3) for every incoming comment/DM/story reply.
//
// Inputs come from the brand's setup:
//   - personalityPrompt    → built during onboarding Step 2 (content personality analysis)
//   - primaryObjective     → their #1 goal (set in onboarding Step 4)
//   - products             → their products/services/links (set in onboarding Step 3)
//   - assets               → shareable links/resources (set in onboarding Step 4)
//   - interactionType      → 'comment' | 'dm' | 'story_reply'
//   - storyContext         → if story_reply: the text/caption of the story they replied to

export type InteractionType = "comment" | "dm" | "story_reply";

export interface PromptProduct {
  name: string;
  description?: string | null;
  price_range?: string | null;
  url?: string | null;
}

export interface PromptAsset {
  label: string;
  url: string;
  when_to_share?: string | null;
}

export interface BuildPromptOptions {
  personalityPrompt: string;
  primaryObjective: string;
  products: PromptProduct[];
  assets: PromptAsset[];
  interactionType: InteractionType;
  storyContext?: string | null; // the story caption/text if this is a story reply
  postContext?: string | null;  // the caption of the post the comment was left on
}

// Maps each primary_objective ID to a clear instruction for Claude
const OBJECTIVE_INSTRUCTIONS: Record<string, string> = {
  grow_engagement:
    "Your goal is to build genuine connection and community. Make people feel heard. Ask follow-up questions when natural. Encourage continued engagement.",
  drive_sales:
    "Your goal is to guide genuinely interested people toward the right product or service — helpfully, never pushy. Mention products only when relevant. Let the conversation breathe.",
  grow_email_list:
    "Your goal is to grow the email list. Work in a natural ask for someone's email only after a couple of exchanges and only when it feels relevant — never on the first message.",
  book_calls:
    "Your goal is to guide people with serious interest toward booking a call. Bring it up only when someone shows genuine buying intent or asks questions that suggest they want to go deeper.",
  grow_followers:
    "Your goal is to create moments that make people want to follow. Be interesting, warm, or funny enough that strangers become fans. Don't explicitly ask people to follow.",
  mix:
    "Use your judgment on every conversation. Sometimes engage and build connection, sometimes recommend a product, sometimes share a link — based entirely on what the person actually needs.",
};

/**
 * Builds the prompt for Step B.5 sensitivity classification.
 * Returns a Claude prompt that outputs JSON with routing, sensitivity_reason,
 * and public_acknowledgement.
 */
export function sensitivityPrompt(
  commentText: string,
  brandContext: string,
  customKeywords: string[] = []
): string {
  const keywordsSection =
    customKeywords.length > 0
      ? `\nAdditional keywords the brand wants flagged: ${customKeywords.join(", ")}.`
      : "";

  return (
    `You are a content moderation assistant for an Instagram brand account.\n\n` +
    `Classify whether this comment requires a private response.\n\n` +
    `Return JSON only — no explanation, no markdown, no code block. Example:\n` +
    `{"routing":"public","sensitivity_reason":null,"public_acknowledgement":null}\n\n` +
    `Routing options:\n` +
    `- "public": safe to reply publicly in the comments, nothing sensitive\n` +
    `- "both": post a short public acknowledgement in the comments AND send full details via DM\n\n` +
    `Use "both" when the comment involves:\n` +
    `- Discount requests or promo codes\n` +
    `- Order problems, shipping issues, wrong items received\n` +
    `- Complaints or strong negative feedback\n` +
    `- Requests for personal information (address, phone, invoice)\n` +
    `- Competitor mentions\n` +
    `- Medical or health questions\n` +
    `- Anything that would be embarrassing or harmful to handle publicly` +
    `${keywordsSection}\n\n` +
    `The "both" route always posts a short visible reply so the commenter and other viewers know they were heard. ` +
    `The full sensitive details are then handled privately via DM.\n\n` +
    `public_acknowledgement: if routing is "both", write one short friendly sentence for the public comment (e.g. "Hey! Sent you a DM with all the details"). Otherwise null.\n` +
    `sensitivity_reason: a 2–5 word label if sensitive (e.g. "discount request", "order complaint", "negative feedback"). Otherwise null.\n\n` +
    `Brand context: ${brandContext}\n\n` +
    `Comment: "${commentText}"`
  );
}

export function buildAgentSystemPrompt(opts: BuildPromptOptions): string {
  const {
    personalityPrompt,
    primaryObjective,
    products,
    assets,
    interactionType,
    storyContext,
    postContext,
  } = opts;

  const parts: string[] = [];

  // ── 1. Personality (voice, tone, style) ────────────────────────────────────
  parts.push(personalityPrompt.trim());

  // ── 2. Primary objective ────────────────────────────────────────────────────
  const objectiveInstruction =
    OBJECTIVE_INSTRUCTIONS[primaryObjective] ?? OBJECTIVE_INSTRUCTIONS.mix;
  parts.push(`YOUR PRIMARY GOAL:\n${objectiveInstruction}`);

  // ── 3. Products / services / offers ────────────────────────────────────────
  if (products.length > 0) {
    const lines = products.map((p) => {
      let line = `- ${p.name}`;
      if (p.description) line += `: ${p.description}`;
      if (p.price_range) line += ` (${p.price_range})`;
      if (p.url) line += ` → ${p.url}`;
      return line;
    });
    parts.push(
      `PRODUCTS / SERVICES / OFFERS YOU CAN MENTION:\n` +
        `When someone asks about price, cost, how much something is, or what you sell — lead immediately with the product name, price, and the direct product link. Do NOT say "link in bio", do NOT ask what they are looking for first, do NOT hedge. Use the exact URL listed below.\n` +
        `For other conversations, only mention products when it naturally fits.\n` +
        lines.join("\n")
    );
  }

  // ── 4. Shareable assets (links, guides, booking pages, etc.) ───────────────
  if (assets.length > 0) {
    const lines = assets.map((a) => {
      let line = `- "${a.label}" → ${a.url}`;
      if (a.when_to_share) line += `\n  Best moment to share: ${a.when_to_share}`;
      return line;
    });
    parts.push(
      `LINKS & ASSETS YOU CAN SHARE:\n` +
        `Share these only when they genuinely fit the conversation. Never force them in or lead with them. ` +
        `Let the conversation reach a natural moment first.\n` +
        lines.join("\n")
    );
  }

  // ── 5. Post context (for comments) ─────────────────────────────────────────
  // When a comment comes in on a specific post, include the post caption so Claude
  // can understand what the comment is about even without an explicit product mention.
  if (interactionType === "comment" && postContext) {
    parts.push(
      `POST CONTEXT:\nThis comment was left on a post with the following caption: "${postContext}"\nUse this to understand what the person is asking about or reacting to.`
    );
  }

  // ── 6. Story reply context ──────────────────────────────────────────────────
  // Story replies arrive as DMs. When we know which story triggered the reply,
  // include it so the agent can reference it naturally.
  if (interactionType === "story_reply") {
    const storyNote = storyContext
      ? `This message is a reply to your story: "${storyContext}". ` +
        `Acknowledge the story naturally if it fits the reply — don't force it.`
      : `This message is a reply to one of your stories. Reference the story context naturally if it's relevant.`;
    parts.push(`CONTEXT:\n${storyNote}`);
  }

  // ── 7. Hard rules ───────────────────────────────────────────────────────────
  const lengthRule =
    interactionType === "comment"
      ? "For comments: keep replies to 1 sentence. Short and genuine always beats long and thoughtful."
      : "For DMs and story replies: up to 3 sentences. Still concise — this is Instagram, not email.";

  parts.push(
    `RULES (non-negotiable):\n` +
      `- ${lengthRule}\n` +
      `- Sound like a real person, not a brand account. No corporate speak.\n` +
      `- Never use markdown formatting. No **bold**, no _italics_, no bullet points. Plain text only — Instagram does not render markdown.\n` +
      `- Never use em dashes (—) or en dashes (–). Use a comma, period, or just end the sentence instead.\n` +
      `- Use emojis based on the personality described above — not excessively.\n` +
      `- If you don't know something, say "Let me check and get back to you!" — never make things up.\n` +
      `- Never be pushy about sales, links, or emails. Genuinely helpful > everything else.\n` +
      `- If someone is rude or trolling, respond with grace or light humour. Never escalate.\n` +
      `- Do not reveal you are an AI unless the person directly and explicitly asks.`
  );

  return parts.join("\n\n");
}
