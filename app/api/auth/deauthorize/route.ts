// app/api/auth/deauthorize/route.ts
// Meta calls this when a user removes WASP from their Instagram settings.
// Verifies the signed_request, finds the account by instagram_user_id, and clears the token.

import { createAdminClient } from "@/lib/supabase";
import { createHmac } from "crypto";
import { NextRequest } from "next/server";

function parseSignedRequest(signedRequest: string, appSecret: string): { user_id?: string } | null {
  try {
    const [encodedSig, payload] = signedRequest.split(".");
    const sig = Buffer.from(encodedSig.replace(/-/g, "+").replace(/_/g, "/"), "base64");
    const expected = createHmac("sha256", appSecret).update(payload).digest();
    if (!sig.equals(expected)) return null;
    return JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    return Response.json({ error: "App secret not configured" }, { status: 500 });
  }

  let signedRequest: string | null = null;
  try {
    const formData = await request.formData();
    signedRequest = formData.get("signed_request") as string;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!signedRequest) {
    return Response.json({ error: "Missing signed_request" }, { status: 400 });
  }

  const data = parseSignedRequest(signedRequest, appSecret);
  if (!data || !data.user_id) {
    return Response.json({ error: "Invalid signed_request" }, { status: 401 });
  }

  const admin = createAdminClient();
  await admin
    .from("brand_accounts")
    .update({
      instagram_access_token_encrypted: null,
      token_expires_at: null,
    })
    .eq("instagram_user_id", data.user_id);

  return Response.json({ url: "https://www.joinwasp.com/privacy", confirmation_code: data.user_id });
}
