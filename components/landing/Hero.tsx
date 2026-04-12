"use client";

import { useState, useEffect } from "react";

export default function Hero() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");
  const [message, setMessage] = useState("");
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((d) => setWaitlistCount(d.count))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.status === 201) {
        setStatus("success");
        setMessage(data.message);
        if (data.count) setWaitlistCount(data.count);
        setEmail("");
      } else if (res.status === 409) {
        setStatus("duplicate");
        setMessage(data.error);
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Connection error. Please try again.");
    }
  }

  return (
    <section
      id="waitlist"
      className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-6 pt-20 sm:pt-24 pb-12 sm:pb-16"
      style={{ overflowX: "hidden" }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#D4FF00 1px, transparent 1px), linear-gradient(90deg, #D4FF00 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow orb — clipped in a contained wrapper so iOS Safari doesn't shift layout */}
      <div className="absolute inset-0 pointer-events-none" style={{ overflow: "hidden" }}>
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full opacity-[0.06] blur-3xl"
          style={{ background: "#D4FF00" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-[#2A2A2A] bg-[#111111] rounded-full px-4 py-1.5 mb-5 sm:mb-8">
          <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-pulse" />
          <span className="text-xs text-[#6B6B6B] tracking-widest uppercase">
            AI Instagram Agent
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-tight sm:leading-[0.95] tracking-tight text-white mb-4 sm:mb-6"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          Put Your Instagram{" "}
          <span className="text-[#D4FF00]">Engagement</span>{" "}
          on Auto-Pilot
        </h1>

        {/* Subline */}
        <p className="w-full max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-[#6B6B6B] mb-8 sm:mb-10 leading-relaxed">
          Not a chatbot. Not a flow builder.{" "}
          <span className="text-[#F5F5F5]">An AI agent that learns your voice</span>,
          replies like you, and never sleeps.
        </p>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto mb-5 sm:mb-6">
          {status === "success" ? (
            <div className="border border-[#D4FF00]/30 bg-[#D4FF00]/10 rounded-2xl px-6 py-5 text-center">
              <p className="text-[#D4FF00] font-bold text-lg mb-1">You're in. 🐝</p>
              <p className="text-[#6B6B6B] text-sm">{message}</p>
              {waitlistCount && (
                <p className="text-white text-sm mt-2 font-medium">
                  #{waitlistCount} on the list
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-5 py-3.5 text-white placeholder-[#4A4A4A] text-sm focus:outline-none focus:border-[#D4FF00] transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-[#D4FF00] text-[#0A0A0A] font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-white transition-colors disabled:opacity-60"
              >
                {status === "loading" ? "Joining..." : "Join the Waitlist"}
              </button>
            </div>
          )}

          {(status === "error" || status === "duplicate") && (
            <p className={`text-sm mt-2 ${status === "duplicate" ? "text-[#D4FF00]" : "text-red-400"}`}>
              {message}
            </p>
          )}
        </form>

        {/* Social proof */}
        {waitlistCount !== null && waitlistCount > 0 && status !== "success" && (
          <p className="text-sm text-[#4A4A4A]">
            Join{" "}
            <span className="text-[#D4FF00] font-semibold">{waitlistCount.toLocaleString()}</span>{" "}
            brands already on the waitlist
          </p>
        )}

        {/* Visual mockup */}
        <div className="mt-12 sm:mt-16 max-w-2xl mx-auto w-full">
          <div className="border border-[#2A2A2A] rounded-2xl bg-[#111111] overflow-hidden">
            {/* Top bar */}
            <div className="border-b border-[#1A1A1A] px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D4FF00] flex-shrink-0" />
                <span className="text-xs text-[#6B6B6B] font-medium truncate">WASP Agent — Active</span>
              </div>
              <span className="text-xs text-[#4A4A4A] flex-shrink-0">2 sent · 0 pending</span>
            </div>

            {/* Mock messages */}
            <div className="p-4 sm:p-5 space-y-4">
              {[
                {
                  user: "@sneakerhead_mike",
                  msg: "These colorways are insane 🔥 where can I buy?",
                  reply: "DMs! Just dropped a few pairs. Link in bio or slide in 👇",
                  delay: "2m ago",
                },
                {
                  user: "@fitcheck_daily",
                  msg: "Been following for years, quality never misses",
                  reply: "That loyalty means everything to us 🙏 new drop coming Thursday 👀",
                  delay: "5m ago",
                },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#2A2A2A] flex-shrink-0 flex items-center justify-center text-xs text-[#6B6B6B]">
                      {item.user[1].toUpperCase()}
                    </div>
                    <div className="bg-[#1A1A1A] rounded-xl rounded-tl-none px-4 py-2.5 max-w-xs">
                      <p className="text-xs text-[#6B6B6B] mb-1">{item.user}</p>
                      <p className="text-sm text-[#F5F5F5]">{item.msg}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-[#D4FF00]/10 border border-[#D4FF00]/20 rounded-xl rounded-tr-none px-4 py-2.5 max-w-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[8px] font-black text-[#D4FF00]">WASP</span>
                        <span className="text-[10px] text-[#D4FF00]/60">{item.delay}</span>
                      </div>
                      <p className="text-sm text-[#F5F5F5]">{item.reply}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
