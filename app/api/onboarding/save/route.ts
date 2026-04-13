import { NextRequest } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { step, data } = body as { step: number; data: Record<string, unknown> };

    const admin = createAdminClient();

    if (step === 0) {
      // Create (or update) the brand_accounts row with account_type
      const { error } = await admin
        .from("brand_accounts")
        .upsert(
          {
            user_id: user.id,
            account_type: data.account_type,
            onboarding_step: 1,
          },
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("Step 0 error:", error);
        return Response.json({ error: "Failed to save" }, { status: 500 });
      }
    }

    if (step === 1) {
      // Instagram connect — placeholder (Phase 2b)
      // Just advance the step counter
      const { error } = await admin
        .from("brand_accounts")
        .update({ onboarding_step: 2 })
        .eq("user_id", user.id);

      if (error) {
        return Response.json({ error: "Failed to save" }, { status: 500 });
      }
    }

    if (step === 2) {
      // Brand voice / personality
      const { error } = await admin
        .from("brand_accounts")
        .update({
          personality_prompt: data.personality_prompt,
          personality_profile: data.personality_profile ?? null,
          onboarding_step: 3,
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Step 2 error:", error);
        return Response.json({ error: "Failed to save" }, { status: 500 });
      }
    }

    if (step === 3) {
      // Products & Links
      // Get brand_account_id first
      const { data: account, error: accountError } = await admin
        .from("brand_accounts")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (accountError || !account) {
        return Response.json({ error: "Account not found" }, { status: 404 });
      }

      const products = (data.products as Array<{
        name: string;
        description?: string;
        price_range?: string;
        url?: string;
      }>) ?? [];

      if (products.length > 0) {
        const rows = products.map((p) => ({
          brand_account_id: account.id,
          user_id: user.id,
          name: p.name,
          description: p.description ?? null,
          price_range: p.price_range ?? null,
          url: p.url ?? null,
        }));

        // Delete existing products for this account then reinsert
        await admin.from("products").delete().eq("brand_account_id", account.id);
        const { error: insertError } = await admin.from("products").insert(rows);

        if (insertError) {
          console.error("Step 3 products error:", insertError);
          return Response.json({ error: "Failed to save products" }, { status: 500 });
        }
      }

      // Advance step
      await admin
        .from("brand_accounts")
        .update({ onboarding_step: 4 })
        .eq("user_id", user.id);
    }

    if (step === 4) {
      // Engagement goals
      const { data: account, error: accountError } = await admin
        .from("brand_accounts")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (accountError || !account) {
        return Response.json({ error: "Account not found" }, { status: 404 });
      }

      const goals = (data.goals as Array<{
        interaction_type: string;
        goal: string;
        goal_url?: string;
      }>) ?? [];

      if (goals.length > 0) {
        const rows = goals.map((g) => ({
          brand_account_id: account.id,
          user_id: user.id,
          interaction_type: g.interaction_type,
          goal: g.goal,
          goal_url: g.goal_url ?? null,
        }));

        await admin
          .from("engagement_goals")
          .delete()
          .eq("brand_account_id", account.id);

        const { error: insertError } = await admin
          .from("engagement_goals")
          .insert(rows);

        if (insertError) {
          console.error("Step 4 goals error:", insertError);
          return Response.json({ error: "Failed to save goals" }, { status: 500 });
        }
      }

      // Mark onboarding complete + save engagement level
      await admin
        .from("brand_accounts")
        .update({
          onboarding_step: 5,
          onboarding_completed: true,
          engagement_level: (data.engagement_level as string) ?? "smart_select",
        })
        .eq("user_id", user.id);

      // Mark in Supabase Auth app_metadata so middleware can read it
      await admin.auth.admin.updateUserById(user.id, {
        app_metadata: { onboarding_completed: true },
      });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Onboarding save error:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// GET: load existing brand_account data so we can resume mid-onboarding
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: account } = await admin
      .from("brand_accounts")
      .select("*, products(*), engagement_goals(*)")
      .eq("user_id", user.id)
      .single();

    return Response.json({ account: account ?? null });
  } catch {
    return Response.json({ account: null });
  }
}
