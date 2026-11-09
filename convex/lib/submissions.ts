import { ConvexError } from "convex/values";
import { RateLimiter, HOUR, DAY } from "@convex-dev/rate-limiter";
import { components } from "../_generated/api";
import type { MutationCtx } from "../_generated/server";
import { hash } from "./access";

// Protection for the public website forms (applications.submit, contact.submit):
// - the honeypot "website" field and requestId idempotency stay in each mutation;
// - forms sent within a few seconds of opening are treated as bots;
// - rate limits overall and per email address, with a readable message;
// - the same details sent again (any form session) are refused with the earlier reference.
export const limiter = new RateLimiter(components.rateLimiter, {
  askSofora: { kind: "token bucket", rate: 120, period: HOUR, capacity: 15 },
  submissions: { kind: "fixed window", rate: 200, period: HOUR },
  emailSubmissions: { kind: "fixed window", rate: 5, period: HOUR },
  emailDaily: { kind: "fixed window", rate: 10, period: DAY },
  applicationUploads: { kind: "fixed window", rate: 30, period: HOUR },
});

const minimumFillMs = 3000;
const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

function wait(ms: number) {
  const minutes = Math.max(1, Math.ceil(ms / 60000));
  return minutes >= 120 ? `${Math.ceil(minutes / 60)} hours` : `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export async function guardSubmission(
  ctx: MutationCtx,
  args: { what: "application" | "message"; email: string; parts: string[]; elapsedMs: number; windowMs: number },
) {
  if (!Number.isFinite(args.elapsedMs) || args.elapsedMs < minimumFillMs)
    throw new ConvexError("That was very quick. Please check your details and press send again.");
  const fingerprint = await hash([args.what, args.email, ...args.parts].map(normalize).join("\u0000"));
  const previous = await ctx.db
    .query("submissionFingerprints")
    .withIndex("by_hash", (q) => q.eq("hash", fingerprint))
    .order("desc")
    .first();
  if (previous && Date.now() - previous.at < args.windowMs)
    throw new ConvexError(
      `We've already received this ${args.what} (reference ${previous.reference}), so there's no need to send it again. We'll be in touch soon.`,
    );
  for (const [name, key] of [
    ["submissions", undefined],
    ["emailSubmissions", args.email],
    ["emailDaily", args.email],
  ] as const) {
    const status = await limiter.limit(ctx, name, key ? { key } : {});
    if (!status.ok)
      throw new ConvexError(
        name === "submissions"
          ? `We're receiving a lot of forms right now. Please try again in ${wait(status.retryAfter)}.`
          : `You've sent several forms in a short time. Please try again in ${wait(status.retryAfter)}, or call us if it's urgent.`,
      );
  }
  return fingerprint;
}

export async function rememberSubmission(ctx: MutationCtx, fingerprint: string, reference: string) {
  await ctx.db.insert("submissionFingerprints", { hash: fingerprint, reference, at: Date.now() });
}
