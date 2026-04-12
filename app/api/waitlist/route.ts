import { NextRequest } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("waitlist")
      .insert({ email: normalized });

    if (error) {
      if (error.code === "23505") {
        return Response.json(
          { error: "You're already on the waitlist!" },
          { status: 409 }
        );
      }
      console.error("Supabase error:", error);
      return Response.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    // Send confirmation email — fire and forget, don't block the response
    const resend = new Resend(process.env.RESEND_API_KEY);
    resend.emails.send({
      from: "WASP <hello@joinwasp.com>",
      to: normalized,
      subject: "You're in, WASP is coming",
      text: `Hey,

You're on the WASP waitlist.

When we launch, you'll get your first month of Pro completely free.

We'll reach out the moment it's ready.

The WASP Team
joinwasp.com`,
    }).catch((err) => console.error("Resend error:", err));

    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    return Response.json(
      { message: "You're on the waitlist!", count: count ?? 0 },
      { status: 201 }
    );
  } catch {
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    if (error) {
      return Response.json({ count: 0 });
    }

    return Response.json({ count: count ?? 0 });
  } catch {
    return Response.json({ count: 0 });
  }
}
