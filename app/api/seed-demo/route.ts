// Demo data seeder — populates the dashboard with realistic fake interactions
// for screencast recording. Idempotent: clears previous demo data before seeding.
// All demo rows use instagram_user_id starting with "demo_" for easy cleanup.
// POST { action: "seed" } → seed data
// POST { action: "clear" } → remove all demo data

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";

function daysAgo(days: number, hoursOffset = 0): string {
  return new Date(Date.now() - days * 86_400_000 + hoursOffset * 3_600_000).toISOString();
}

function minutesAfter(isoDate: string, mins: number): string {
  return new Date(new Date(isoDate).getTime() + mins * 60_000).toISOString();
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const action: string = body.action ?? "seed";

  const admin = createAdminClient();
  const { data: account } = await admin
    .from("brand_accounts")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!account) return NextResponse.json({ error: "No brand account found" }, { status: 400 });

  // ── Clear all previous demo data ──────────────────────────────────────────────
  await admin
    .from("interactions")
    .delete()
    .eq("brand_account_id", account.id)
    .like("instagram_user_id", "demo_%");

  await admin
    .from("sting_triggers")
    .delete()
    .eq("brand_account_id", account.id)
    .eq("name", "Product Link");

  if (action === "clear") {
    return NextResponse.json({ ok: true, action: "cleared" });
  }

  // ── Sting trigger ─────────────────────────────────────────────────────────────
  const { data: stingTrigger } = await admin
    .from("sting_triggers")
    .insert({
      brand_account_id: account.id,
      user_id: account.user_id,
      name: "Product Link",
      trigger_type: "keyword",
      trigger_keywords: ["link", "send", "info"],
      comment_reply: "Just sent it to your DMs! 🐝",
      dm_message: "Hey! Here's the direct link you asked for — let me know if you have any questions 🙌",
      dm_link: "https://joinwasp.com",
      applies_to: "all_posts",
      is_active: true,
      times_triggered: 7,
    })
    .select("id")
    .single();

  const stingTriggerId = stingTrigger?.id ?? null;

  // ── 8 pending interactions ────────────────────────────────────────────────────

  const pending = [
    {
      brand_account_id: account.id,
      user_id: account.user_id,
      interaction_type: "comment",
      instagram_user_id: "demo_user_1",
      instagram_username: "fashionlover_22",
      message_text: "How much is this?",
      drafted_response: "Starting at $45! Tap the link in our bio to see all sizes and options 🛍️",
      comment_category: "purchase_intent",
      source_post_id: "demo_post_1",
      status: "pending",
      created_at: daysAgo(0, -1),
    },
    {
      brand_account_id: account.id,
      user_id: account.user_id,
      interaction_type: "comment",
      instagram_user_id: "demo_user_2",
      instagram_username: "style.insider",
      message_text: "Do you ship to Dubai?",
      drafted_response: "Yes we do! 🌍 Usually takes 7-10 days. DM us after ordering and we'll send you tracking info",
      comment_category: "question",
      source_post_id: "demo_post_2",
      status: "pending",
      created_at: daysAgo(0, -2),
    },
    {
      brand_account_id: account.id,
      user_id: account.user_id,
      interaction_type: "comment",
      instagram_user_id: "demo_user_3",
      instagram_username: "ahmed.designs",
      message_text: "This looks amazing 🔥🔥",
      drafted_response: "Thank you so much! 🙏 Means the world to us",
      comment_category: "compliment",
      source_post_id: "demo_post_1",
      status: "pending",
      created_at: daysAgo(0, -3),
    },
    {
      brand_account_id: account.id,
      user_id: account.user_id,
      interaction_type: "dm",
      instagram_user_id: "demo_user_4",
      instagram_username: "priya.creates",
      message_text: "Hey, I saw your post about the midnight collection. Can you tell me more?",
      drafted_response: "Of course! The midnight collection is our bestseller right now. DM me your size and I can help you find the perfect fit 🖤",
      status: "pending",
      created_at: daysAgo(0, -4),
    },
    {
      brand_account_id: account.id,
      user_id: account.user_id,
      interaction_type: "comment",
      instagram_user_id: "demo_user_5",
      instagram_username: "user_malik7",
      message_text: "Is this worth the price? Seems expensive",
      drafted_response: "Totally get that! The quality is built to last and most customers end up reordering. Happy to answer any specific questions 🙌",
      comment_category: "meaningful_feedback",
      source_post_id: "demo_post_3",
      status: "pending",
      created_at: daysAgo(0, -5),
    },
    {
      brand_account_id: account.id,
      user_id: account.user_id,
      interaction_type: "dm",
      instagram_user_id: "demo_user_6",
      instagram_username: "sara.creates",
      message_text: "Do you have any discount codes?",
      drafted_response: "We do seasonal offers! Drop your email and you'll be first to know about our next one 📩",
      status: "pending",
      created_at: daysAgo(0, -6),
    },
    {
      brand_account_id: account.id,
      user_id: account.user_id,
      interaction_type: "comment",
      instagram_user_id: "demo_user_7",
      instagram_username: "khalid.shop",
      message_text: "LINK",
      drafted_response: "Just sent it to your DMs! 🐝",
      comment_category: "purchase_intent",
      source_post_id: "demo_post_2",
      sting_trigger_id: stingTriggerId,
      status: "pending",
      created_at: daysAgo(0, -7),
    },
    {
      brand_account_id: account.id,
      user_id: account.user_id,
      interaction_type: "story_reply",
      instagram_user_id: "demo_user_8",
      instagram_username: "nour.styles",
      message_text: "Love this! Where can I get one?",
      drafted_response: "You can shop it right now, tap the link in our bio 🛍️ Let me know if you need help with sizing!",
      status: "pending",
      created_at: daysAgo(0, -8),
    },
  ];

  await admin.from("interactions").insert(pending);

  // ── ~18 historical interactions spread over 14 days ───────────────────────────

  const history = [
    // Day 14
    {
      brand_account_id: account.id, user_id: account.user_id,
      interaction_type: "comment", instagram_user_id: "demo_hist_1",
      instagram_username: "fatima.picks", message_text: "Obsessed with this 😍",
      drafted_response: "That makes our whole day! 😍 Welcome to the family",
      final_response: "That makes our whole day! 😍 Welcome to the family",
      comment_category: "compliment", source_post_id: "demo_post_1",
      status: "approved", created_at: daysAgo(14, 2),
      responded_at: minutesAfter(daysAgo(14, 2), 15),
    },
    // Day 13
    {
      brand_account_id: account.id, user_id: account.user_id,
      interaction_type: "dm", instagram_user_id: "demo_hist_2",
      instagram_username: "lena.mode", message_text: "What sizes do you carry?",
      drafted_response: "We go from XS to XL! If you let me know your measurements I can help you pick the right fit 📏",
      final_response: "We go from XS to XL! If you let me know your measurements I can help you pick the right fit 📏",
      status: "auto_sent", created_at: daysAgo(13, 4),
      responded_at: minutesAfter(daysAgo(13, 4), 2),
    },
    // Day 12
    {
      brand_account_id: account.id, user_id: account.user_id,
      interaction_type: "comment", instagram_user_id: "demo_hist_3",
      instagram_username: "zara.looks", message_text: "Can you restock the black one?",
      drafted_response: "Yes! Restock drops this Friday, make sure you're following so you catch it 🔔",
      final_response: "Yes! Restock drops this Friday, make sure you're following so you catch it 🔔",
      comment_category: "question", source_post_id: "demo_post_2",
      status: "approved", created_at: daysAgo(12, 1),
      responded_at: minutesAfter(daysAgo(12, 1), 8),
    },
    {
      brand_account_id: account.id, user_id: account.user_id,
      interaction_type: "comment", instagram_user_id: "demo_hist_4",
      instagram_username: "maya.essentials", message_text: "Where is this from? 😍",
      drafted_response: "From us! 😍 Link in bio to shop the full collection",
      final_response: "From us! 😍 Link in bio to shop the full collection",
      comment_category: "question", source_post_id: "demo_post_3",
      status: "approved", created_at: daysAgo(12, 5),
      responded_at: minutesAfter(daysAgo(12, 5), 12),
    },
    // Day 11
    {
      brand_account_id: account.id, user_id: account.user_id,
      interaction_type: "comment", instagram_user_id: "demo_hist_5",
      instagram_username: "amira.style", message_text: "SEND",
      drafted_response: "Just sent it to your DMs! 🐝",
      final_response: "Just sent it to your DMs! 🐝",
      comment_category: "purchase_intent", source_post_id: "demo_post_1",
      sting_trigger_id: stingTriggerId,
      status: "auto_sent", created_at: daysAgo(11, 3),
      responded_at: minutesAfter(daysAgo(11, 3), 1),
    },
    {
      brand_account_id: account.id, user_id: account.user_id,
      interaction_type: "dm", instagram_user_id: "demo_hist_6",
      instagram_username: "noura.fashion", message_text: "Is the quality good? I keep seeing mixed reviews",
      drafted_response: "I hear you! The material is 100% premium cotton, really holds its shape after washing. We have a 30-day return policy if you want to try risk-free 🤍",
      final_response: "I hear you! The material is 100% premium cotton, really holds its shape after washing. We have a 30-day return policy if you want to try risk-free 🤍",
      status: "approved", created_at: daysAgo(11, 7),
      responded_at: minutesAfter(daysAgo(11, 7), 20),
    },
    // Day 10
    {
      brand_account_id: account.id, user_id: account.user_id,
      interaction_type: "comment", instagram_user_id: "demo_hist_7",
      instagram_username: "hana.picks", message_text: "This is everything 🙌",
      drafted_response: "Right?! 🙌 So happy you love it",
      final_response: "Right?! 🙌 So happy you love it",
      comment_category: "compliment", source_post_id: "demo_post_2",
      status: "approved", created_at: daysAgo(10, 2),
      responded_at: minutesAfter(daysAgo(10, 2), 10),
    },
    {
      brand_account_id: account.id, user_id: account.user_id,
      interaction_type: "comment", instagram_user_id: "demo_hist_8",
      instagram_username: "reem.creates", message_text: "How do I order?",
      drafted_response: "Super easy! Tap the link in our bio, pick your size, and you're done. Let me know if you need help 💛",
      final_response: "Super easy! Tap the link in our bio, pick your size, and you're done. Let me know if you need help 💛",
      comment_category: "question", source_post_id: "demo_post_3",
      status: "approved", created_at: daysAgo(10, 6),
      responded_at: minutesAfter(daysAgo(10, 6), 7),
    },
    // Day 9
    {
      brand_account_id: account.id, user_id: account.user_id,
      interaction_type: "dm", instagram_user_id: "demo_hist_9",
      instagram_username: "layla.mode",
      message_text: "Hey I ordered 3 days ago and haven't heard anything",
      drafted_response: "Hey! So sorry for the wait, let me look into that for you right now. Can you share your order number?",
      final_response: "Hey! So sorry about the delay, looking into this now. Can you share your order number and I'll get this sorted for you personally 🙏",
      status: "edited", created_at: daysAgo(9, 3),
      responded_at: minutesAfter(daysAgo(9, 3), 25),
    },
    {
      brand_account_id: account.id, user_id: account.user_id,
      interaction_type: "comment", instagram_user_id: "demo_hist_10",
      instagram_username: "spambot_9912", message_text: "Follow me for free followers!!!",
      drafted_response: null, comment_category: "spam",
      source_post_id: "demo_post_1",
      status: "rejected", created_at: daysAgo(9, 5),
    },
    // Day 8
    {
      brand_account_id: account.id, user_id: account.user_id,
      interaction_type: "comment", instagram_user_id: "demo_hist_11",
      instagram_username: "jana.buys", message_text: "Is this available in white?",
      drafted_response: "Yes! The white version is actually our most popular 🤍 Same link in bio",
      final_response: "Yes! The white version is actually our most popular 🤍 Same link in bio",
      comment_category: "question", source_post_id: "demo_post_2",
      status: "auto_sent", created_at: daysAgo(8, 1),
      responded_at: minutesAfter(daysAgo(8, 1), 1),
    },
    {
      brand_account_id: account.id, user_id: account.user_id,
      interaction_type: "story_reply", instagram_user_id: "demo_hist_12",
      instagram_username: "sara.mode", message_text: "I need this in my life",
      drafted_response: "Then it's yours 😄 Link in bio, goes live today!",
      final_response: "Then it's yours 😄 Link in bio, goes live today!",
      status: "auto_sent", created_at: daysAgo(8, 4),
      responded_at: minutesAfter(daysAgo(8, 4), 2),
    },
    // Day 7
    {
      brand_account_id: account.id, user_id: account.user_id,
      interaction_type: "comment", instagram_user_id: "demo_hist_13",
      instagram_username: "dina.looks", message_text: "Do you have a physical store?",
      drafted_response: "Online only for now, but we're working on it! 🏪 For now everything ships within 3-5 days",
      final_response: "Online only for now, but we're working on it! 🏪 For now everything ships within 3-5 days",
      comment_category: "question", source_post_id: "demo_post_3",
      status: "approved", created_at: daysAgo(7, 2),
      responded_at: minutesAfter(daysAgo(7, 2), 18),
    },
    {
      brand_account_id: account.id, user_id: account.user_id,
      interaction_type: "comment", instagram_user_id: "demo_hist_14",
      instagram_username: "mia.style", message_text: "😍😍😍",
      drafted_response: null, comment_category: "hype_emoji",
      source_post_id: "demo_post_1",
      status: "skipped", created_at: daysAgo(7, 4),
    },
    {
      brand_account_id: account.id, user_id: account.user_id,
      interaction_type: "dm", instagram_user_id: "demo_hist_15",
      instagram_username: "rana.picks",
      message_text: "I bought one last week and genuinely love it, wanted to say thanks",
      drafted_response: "This genuinely made our day 🙏 Reviews like this are why we do what we do. Thank you so much Rana!",
      final_response: "This genuinely made our day 🙏 Reviews like this are why we do what we do. Thank you so much Rana!",
      status: "auto_sent", created_at: daysAgo(7, 6),
      responded_at: minutesAfter(daysAgo(7, 6), 3),
    },
    // Day 5 & 4 — higher volume for chart trend
    {
      brand_account_id: account.id, user_id: account.user_id,
      interaction_type: "comment", instagram_user_id: "demo_hist_16",
      instagram_username: "lara.fashion", message_text: "Price?",
      drafted_response: "Starting at $45! Full pricing in the link in our bio 🛍️",
      final_response: "Starting at $45! Full pricing in the link in our bio 🛍️",
      comment_category: "purchase_intent", source_post_id: "demo_post_2",
      status: "approved", created_at: daysAgo(5, 1),
      responded_at: minutesAfter(daysAgo(5, 1), 9),
    },
    {
      brand_account_id: account.id, user_id: account.user_id,
      interaction_type: "dm", instagram_user_id: "demo_hist_17",
      instagram_username: "sana.buys",
      message_text: "Can I return if it doesn't fit?",
      drafted_response: "Of course! 30-day returns, no questions asked. Just DM us the order number 🙌",
      final_response: "Of course! 30-day returns, no questions asked. Just DM us the order number 🙌",
      status: "approved", created_at: daysAgo(4, 3),
      responded_at: minutesAfter(daysAgo(4, 3), 11),
    },
    {
      brand_account_id: account.id, user_id: account.user_id,
      interaction_type: "comment", instagram_user_id: "demo_hist_18",
      instagram_username: "tara.edits",
      message_text: "INFO",
      drafted_response: "Just sent it to your DMs! 🐝",
      final_response: "Just sent it to your DMs! 🐝",
      comment_category: "purchase_intent", source_post_id: "demo_post_3",
      sting_trigger_id: stingTriggerId,
      status: "auto_sent", created_at: daysAgo(4, 5),
      responded_at: minutesAfter(daysAgo(4, 5), 1),
    },
  ];

  await admin.from("interactions").insert(history);

  return NextResponse.json({
    ok: true,
    action: "seeded",
    pending: pending.length,
    history: history.length,
    stingTrigger: stingTriggerId ? "created" : "failed",
  });
}
