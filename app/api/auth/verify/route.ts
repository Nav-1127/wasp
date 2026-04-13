import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { token_hash, type } = await request.json();

    if (!token_hash || !type) {
      return Response.json({ error: "Missing token_hash or type" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "email" | "recovery" | "invite" | "email_change",
    });

    if (error) {
      console.error("verifyOtp error:", error.message);
      return Response.json(
        { error: error.message.includes("expired") ? "otp_expired" : error.message },
        { status: 400 }
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Verify route error:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
