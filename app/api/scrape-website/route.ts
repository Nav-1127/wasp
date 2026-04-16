// /api/scrape-website
// Fetches a URL server-side, strips HTML to plain text, then asks Claude Sonnet 4.6
// to identify products/services/links. Returns structured items for user review.

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerSupabaseClient } from "@/lib/supabase";

interface ExtractedItem {
  id: string;
  name: string;
  description: string;
  price_range: string;
  url: string;
}

export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // ── Parse + validate URL ────────────────────────────────────────────────────
  const body = await request.json().catch(() => ({}));
  const rawUrl = (body as { url?: string }).url?.trim();

  if (!rawUrl) return Response.json({ error: "URL required" }, { status: 400 });

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    return Response.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
  }

  // ── Fetch the page ──────────────────────────────────────────────────────────
  let pageText: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    const res = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; WASP/1.0; +https://joinwasp.com)",
        "Accept": "text/html,application/xhtml+xml,*/*",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    // Strip scripts, styles, and all tags — collapse whitespace
    pageText = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 15_000); // cap at 15k chars to stay within token limits
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[scrape-website] fetch failed:", msg);
    return Response.json(
      { error: `Could not load that website: ${msg}. Try a different URL or use manual entry.` },
      { status: 422 }
    );
  }

  if (!pageText) {
    return Response.json(
      { error: "The page loaded but contained no readable text." },
      { status: 422 }
    );
  }

  // ── Claude extraction ───────────────────────────────────────────────────────
  const anthropic = new Anthropic();

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system:
        "You are a product data extraction assistant. Extract structured product and service information from website text. Respond ONLY with valid JSON — no explanation, no markdown.",
      messages: [
        {
          role: "user",
          content: `Extract all products, services, courses, offers, or links from the text below.

Return a JSON array where each item has:
- name: string (required, the product/service/link name)
- description: string (max 100 chars, what it is — empty string if unclear)
- price_range: string (e.g. "$29", "$10–$50", "Free" — empty string if not found)
- url: string (direct URL to the product/offer if visible — empty string if not found)

Rules:
- Only include real products, services, courses, memberships, or offers — NOT nav links, footer links, or generic page sections.
- Maximum 20 items.
- If nothing qualifies, return [].

Source URL: ${parsedUrl.toString()}

Page text:
${pageText}`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type !== "text") throw new Error("Unexpected response type");

    let raw: unknown;
    try {
      // Strip any markdown code fences Claude might sneak in
      const cleaned = block.text.trim().replace(/^```[a-z]*\n?/i, "").replace(/```$/,"");
      raw = JSON.parse(cleaned);
    } catch {
      raw = [];
    }

    const items: ExtractedItem[] = (Array.isArray(raw) ? raw : [])
      .slice(0, 20)
      .map((item: Record<string, unknown>) => ({
        id: crypto.randomUUID(),
        name:        typeof item.name        === "string" ? item.name        : "",
        description: typeof item.description === "string" ? item.description : "",
        price_range: typeof item.price_range === "string" ? item.price_range : "",
        url:         typeof item.url         === "string" ? item.url         : "",
      }))
      .filter((item) => item.name.trim()); // drop blank-name rows

    return Response.json({ items });
  } catch (err) {
    console.error("[scrape-website] Claude error:", err);
    return Response.json(
      { error: "Failed to extract products from that page. Try manual entry." },
      { status: 500 }
    );
  }
}
