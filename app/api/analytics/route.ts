// app/api/analytics/route.ts
// Computes engagement analytics from the interactions table.
// Fetches raw rows and processes them in JS (volumes are small enough).

import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";

interface Row {
  status: string;
  interaction_type: string;
  created_at: string;
  responded_at: string | null;
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    const now = new Date();
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();
    const thirtyDaysAgo = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    const [monthlyResult, thirtyDayResult] = await Promise.all([
      admin
        .from("interactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", monthStart),
      admin
        .from("interactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: true }),
    ]);

    const monthly: Row[] = (monthlyResult.data ?? []) as Row[];
    const thirtyDay: Row[] = (thirtyDayResult.data ?? []) as Row[];

    // ── Hero metrics ──────────────────────────────────────────────────────────

    const totalThisMonth = monthly.length;

    const replied = monthly.filter((i) =>
      ["approved", "edited", "auto_sent"].includes(i.status)
    );
    const dismissed = monthly.filter((i) =>
      ["rejected", "skipped"].includes(i.status)
    );
    const totalHandled = replied.length + dismissed.length;
    const replyRate =
      totalHandled > 0
        ? Math.round((replied.length / totalHandled) * 100)
        : 0;

    const withTime = monthly.filter((i) => i.responded_at && i.created_at);
    const avgMs =
      withTime.length > 0
        ? withTime.reduce((sum: number, i: Row) => {
            const diff =
              new Date(i.responded_at!).getTime() -
              new Date(i.created_at).getTime();
            return sum + diff;
          }, 0) / withTime.length
        : 0;
    const avgResponseTimeMins = Math.round(avgMs / 60000);

    const approvedCount = monthly.filter((i) => i.status === "approved").length;
    const editedCount = monthly.filter((i) => i.status === "edited").length;
    const agentAccuracy =
      approvedCount + editedCount > 0
        ? Math.round((approvedCount / (approvedCount + editedCount)) * 100)
        : 0;

    // ── Daily counts (last 30 days) ────────────────────────────────────────────

    const dayMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      dayMap[key] = 0;
    }
    thirtyDay.forEach((i) => {
      const key = (i.created_at as string).split("T")[0];
      if (key in dayMap) dayMap[key]++;
    });
    const dailyCounts = Object.entries(dayMap).map(([date, count]) => ({
      date,
      count,
    }));

    // ── By type (last 30 days) ─────────────────────────────────────────────────

    const byType = {
      comment: thirtyDay.filter((i) => i.interaction_type === "comment").length,
      dm: thirtyDay.filter((i) => i.interaction_type === "dm").length,
      story_reply: thirtyDay.filter((i) => i.interaction_type === "story_reply")
        .length,
    };

    // ── Approval rate per day (last 30 days) ──────────────────────────────────

    const approvalByDay = dailyCounts.map(({ date }) => {
      const dayItems = thirtyDay.filter((i) =>
        (i.created_at as string).startsWith(date)
      );
      const dayApproved = dayItems.filter((i) => i.status === "approved").length;
      const dayActioned = dayItems.filter((i) =>
        ["approved", "edited"].includes(i.status)
      ).length;
      return {
        date,
        rate:
          dayActioned > 0
            ? Math.round((dayApproved / dayActioned) * 100)
            : null,
      };
    });

    return Response.json({
      total_this_month: totalThisMonth,
      reply_rate: replyRate,
      avg_response_time_mins: avgResponseTimeMins,
      agent_accuracy: agentAccuracy,
      daily_counts: dailyCounts,
      by_type: byType,
      approval_by_day: approvalByDay,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return Response.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
