import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";
import { decryptToken } from "@/lib/instagram";

const INSTAGRAM_GRAPH = "https://graph.instagram.com/v21.0";

const MOCK_POSTS = [
  {
    id: "mock_1",
    caption: "Just dropped our new collection 🔥 Which piece is your favourite? Let me know below! #fashion #newdrop",
    thumbnail_url: null,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    media_type: "IMAGE",
  },
  {
    id: "mock_2",
    caption: "Behind the scenes at today's shoot 📸 Swipe to see the full look. Link in bio for the free guide!",
    thumbnail_url: null,
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    media_type: "IMAGE",
  },
  {
    id: "mock_3",
    caption: "Flash sale — 30% off everything this weekend only! Comment PROMO for your exclusive discount code 🎁",
    thumbnail_url: null,
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    media_type: "IMAGE",
  },
  {
    id: "mock_4",
    caption: "Collab with @partner — we had so much fun making this! Comment COLLAB if you want to work with us 🤝",
    thumbnail_url: null,
    timestamp: new Date(Date.now() - 432000000).toISOString(),
    media_type: "IMAGE",
  },
  {
    id: "mock_5",
    caption: "Free PDF guide dropping tomorrow — comment GUIDE to get notified when it's live 📖",
    thumbnail_url: null,
    timestamp: new Date(Date.now() - 604800000).toISOString(),
    media_type: "IMAGE",
  },
  {
    id: "mock_6",
    caption: "Monday motivation ✨ Tag someone who needs to see this today",
    thumbnail_url: null,
    timestamp: new Date(Date.now() - 864000000).toISOString(),
    media_type: "IMAGE",
  },
];

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Mock mode — no Meta credentials configured
    if (!process.env.META_APP_ID) {
      return Response.json({ posts: MOCK_POSTS });
    }

    const admin = createAdminClient();
    const { data: account } = await admin
      .from("brand_accounts")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!account || !account.instagram_access_token_encrypted) {
      return Response.json({ posts: [] });
    }

    const token = decryptToken(account.instagram_access_token_encrypted);
    const igUserId = account.instagram_user_id as string;

    const res = await fetch(
      `${INSTAGRAM_GRAPH}/${igUserId}/media` +
        `?fields=id,caption,media_url,thumbnail_url,timestamp,media_type` +
        `&limit=25&access_token=${token}`
    );
    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("[instagram/posts] API error:", data.error?.message);
      return Response.json({ posts: [] });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const posts = (data.data ?? []).map((p: any) => ({
      id: p.id as string,
      caption: (p.caption as string) ?? null,
      thumbnail_url: (p.thumbnail_url as string) ?? (p.media_url as string) ?? null,
      timestamp: p.timestamp as string,
      media_type: (p.media_type as string) ?? "IMAGE",
    }));

    return Response.json({ posts });
  } catch (err) {
    console.error("[instagram/posts]", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
