// lib/job-queue.ts
// QStash-backed job queue for async comment and DM processing.
//
// Each brand gets two named QStash queues for priority routing:
//   wasp-brand-{id}-hi  — purchase_intent, customer_support, all DMs
//   wasp-brand-{id}-lo  — compliments, spam, other
//
// Both queues run in parallel and independently. A low-priority comment never
// blocks a high-priority one, even within the same brand. Brand A's surge
// never affects Brand B — each brand's queues are completely private.
//
// Priority is determined at intake using fast keyword heuristics (no API call).
// The full AI classification still runs inside processComment/processDM —
// intake routing just needs to be directionally correct (~80% accuracy is fine).
//
// When QSTASH_TOKEN is not set (local dev / mock mode), publishJob() returns
// false and callers fall back to direct inline processing — no behaviour change.

import { Client, Receiver } from "@upstash/qstash";
import type { WebhookComment, WebhookDM } from "@/lib/agent";

// ── Types ──────────────────────────────────────────────────────────────────────

export type QStashJob =
  | { jobType: "comment"; data: WebhookComment }
  | { jobType: "dm";      data: WebhookDM }
  | { jobType: "send";    interactionId: string };

// ── Config ─────────────────────────────────────────────────────────────────────

/**
 * The URL QStash will POST jobs to.
 * Set PROCESS_JOB_URL in Vercel environment variables:
 *   Production:  https://joinwasp.com/api/process-job
 *   Dev branch:  https://<your-preview-url>/api/process-job
 * Falls back to VERCEL_URL (auto-set by Vercel on preview deployments) if
 * PROCESS_JOB_URL is not set.
 */
export function workerUrl(): string {
  if (process.env.PROCESS_JOB_URL) return process.env.PROCESS_JOB_URL;
  if (process.env.VERCEL_URL)       return `https://${process.env.VERCEL_URL}/api/process-job`;
  return "http://localhost:3000/api/process-job";
}

export function isQStashEnabled(): boolean {
  return !!process.env.QSTASH_TOKEN;
}

// ── Receiver (used in /api/process-job for signature verification) ─────────────

export function createReceiver(): Receiver {
  return new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY ?? "",
    nextSigningKey:    process.env.QSTASH_NEXT_SIGNING_KEY    ?? "",
  });
}

// ── Priority routing ───────────────────────────────────────────────────────────

/**
 * Determine queue priority using keyword heuristics — no API call, instant.
 * High priority = purchase_intent or customer_support comments, and all DMs.
 * ~80% accuracy is the goal; the authoritative AI classification runs later
 * inside processComment/processDM.
 */
function isHighPriority(job: QStashJob): boolean {
  if (job.jobType === "dm")   return true;  // DMs are always high priority
  if (job.jobType === "send") return false; // send jobs carry no AI work

  const text = job.data.comment_text;
  return (
    // customer_support signals
    /(order|package|arriv|deliver|wrong item|missing|broken|refund|return|complaint|issue|problem|help me|not working)/i.test(text) ||
    // purchase_intent signals
    /(buy|purchase|price|cost|how much|available|in stock|where can i|checkout|shipping|ship to|link to buy)/i.test(text)
  );
}

function hiQueueName(brandAccountId: string): string {
  return `wasp-brand-${brandAccountId}-hi`;
}

function loQueueName(brandAccountId: string): string {
  return `wasp-brand-${brandAccountId}-lo`;
}

// ── Queue setup ────────────────────────────────────────────────────────────────

/**
 * Ensure both priority queues exist for a brand.
 * parallelism: 1 = one job at a time per queue.
 * Upsert is idempotent — safe to call on every publish.
 */
async function ensureBrandQueues(
  client: Client,
  brandAccountId: string
): Promise<void> {
  const hi = client.queue({ queueName: hiQueueName(brandAccountId) });
  const lo = client.queue({ queueName: loQueueName(brandAccountId) });
  await Promise.all([
    hi.upsert({ parallelism: 1 }),
    lo.upsert({ parallelism: 1 }),
  ]);
}

// ── publishJob ─────────────────────────────────────────────────────────────────

/**
 * Publish a job to a brand's dedicated QStash queue.
 *
 * - comment jobs: routed to hi or lo queue based on keyword priority heuristics.
 * - dm jobs: always routed to the hi queue.
 * - send jobs (delayed reply dispatch): published directly with a delay,
 *   bypassing the brand queues (no Anthropic calls involved).
 *
 * Returns false when QStash is not configured — callers fall back to inline
 * processing so local dev continues to work without any Upstash account.
 */
export async function publishJob(
  brandAccountId: string,
  job: QStashJob,
  delaySecs = 0
): Promise<boolean> {
  if (!process.env.QSTASH_TOKEN) return false;

  const client = new Client({ token: process.env.QSTASH_TOKEN });
  const url = workerUrl();

  if (job.jobType === "send") {
    // Delayed send: publish directly (no brand queue needed — just an API call)
    await client.publishJSON({
      url,
      body: job,
      retries: 3,
      ...(delaySecs > 0 ? { delay: delaySecs } : {}),
    });
    return true;
  }

  // Process jobs: route to hi or lo based on priority
  await ensureBrandQueues(client, brandAccountId);
  const qName = isHighPriority(job) ? hiQueueName(brandAccountId) : loQueueName(brandAccountId);
  const q = client.queue({ queueName: qName });
  await q.enqueueJSON({
    url,
    body: job,
    retries: 3,
  });

  return true;
}
