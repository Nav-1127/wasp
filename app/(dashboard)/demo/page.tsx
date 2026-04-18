"use client";

import { useState } from "react";
import DashboardShell from "@/components/dashboard-shell";

export default function DemoPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function callSeed(action: "seed" | "clear") {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/seed-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      if (action === "seed") {
        setStatus(`Seeded ${data.pending} pending + ${data.history} historical interactions.`);
      } else {
        setStatus("Demo data cleared.");
      }
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell>
      <div className="max-w-lg mx-auto py-16 px-4">
        <h1 className="text-xl font-semibold mb-2">Demo Data</h1>
        <p className="text-sm text-gray-500 mb-8">
          Populate the dashboard with realistic fake interactions for screencast
          recording. Safe to run multiple times — clears previous demo data first.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => callSeed("seed")}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#FFDE5A] text-black font-medium text-sm hover:bg-yellow-300 disabled:opacity-50 transition-colors"
          >
            {loading ? "Loading..." : "Load Demo Data"}
          </button>
          <button
            onClick={() => callSeed("clear")}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Clear Demo Data
          </button>
        </div>

        {status && (
          <p className="mt-4 text-sm text-gray-600">{status}</p>
        )}
      </div>
    </DashboardShell>
  );
}
