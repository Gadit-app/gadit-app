/**
 * ai-cost.ts — self-hosted cost telemetry for every OpenAI call Gadit makes.
 *
 * WHY: OpenAI's own dashboard groups spend by MODEL only. It cannot tell us
 * which PRODUCT FEATURE burned the money (a full definition vs a Reader
 * word-tap vs an image vs Arabic tashkeel). Gadi needs that split to plan
 * pricing (e.g. should the "understand every word" Reader be its own paid
 * tier?). So each OpenAI-calling endpoint logs here, and /admin/ai-costs
 * reads the daily rollups back.
 *
 * SHAPE: one Firestore doc per UTC day in the `aiUsage` collection, id =
 * "YYYY-MM-DD". Every field is a running counter merged with
 * FieldValue.increment, so a write is O(1) and never reads first. The doc:
 *   {
 *     day, updatedAt,
 *     totalCost, totalCalls,
 *     features: { <feature>: { cost, calls, tokensIn, tokensOut, images } },
 *     models:   { <model>:   { cost, calls } },
 *     plans:    { <plan>:    { cost, calls } },
 *   }
 *
 * Prices are hard-coded (USD per 1M tokens for chat, flat per image). They
 * are ESTIMATES kept in one place — when OpenAI changes pricing, edit
 * PRICING / IMAGE_COST here and the whole dashboard follows. The point is
 * relative attribution ("images are 60% of spend"), which stays correct even
 * if the absolute number drifts a few percent from the invoice.
 *
 * Telemetry must NEVER break a user request: every write is fire-and-forget
 * and swallows its own errors.
 */
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";

/** USD per 1,000,000 tokens. Update when OpenAI list prices change. */
export const PRICING: Record<string, { in: number; out: number }> = {
  "gpt-4o": { in: 2.5, out: 10 },
  "gpt-4o-mini": { in: 0.15, out: 0.6 },
  "gpt-4o-mini-tts": { in: 0.6, out: 0 },
};

/** Flat USD per generated image (gpt-image-1, 1024x1024), keyed by quality. */
export const IMAGE_COST: Record<string, number> = {
  low: 0.011,
  medium: 0.042,
  high: 0.167,
};

export function chatCostUsd(model: string, tokensIn: number, tokensOut: number): number {
  const p = PRICING[model];
  if (!p) return 0;
  return (tokensIn * p.in + tokensOut * p.out) / 1_000_000;
}

export function imageCostUsd(quality = "low"): number {
  return IMAGE_COST[quality] ?? IMAGE_COST.low;
}

/** UTC day bucket "YYYY-MM-DD". Spend rolls up per UTC day (matches how the
 *  OpenAI dashboard buckets, so cross-checking a single day lines up). */
function dayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

// Firestore map KEYS can't contain . $ [ ] / # — sanitise feature/model/plan.
function safeKey(s: string): string {
  return (s || "unknown").replace(/[.$/[\]#]/g, "_").slice(0, 60) || "unknown";
}

type LogArgs = {
  /** Product-feature label, e.g. "define", "reader_word_tap", "image". */
  feature: string;
  /** OpenAI model id, e.g. "gpt-4o", "gpt-image-1". */
  model: string;
  tokensIn?: number;
  tokensOut?: number;
  /** Number of images generated (for gpt-image-1). */
  images?: number;
  /** Image quality, drives per-image price. Defaults to "low". */
  imageQuality?: string;
  /** Pre-computed cost. When given, overrides the token/image math. */
  costUsd?: number;
  /** User plan at call time: basic/clear/deep/family/schools/anon. */
  plan?: string;
};

/**
 * Record one OpenAI call. Fire-and-forget: callers do `void logAiUsage(...)`
 * and never await it on the request's critical path.
 */
export async function logAiUsage(a: LogArgs): Promise<void> {
  try {
    const tokensIn = a.tokensIn ?? 0;
    const tokensOut = a.tokensOut ?? 0;
    const images = a.images ?? 0;
    const cost =
      a.costUsd ??
      (images > 0
        ? images * imageCostUsd(a.imageQuality)
        : chatCostUsd(a.model, tokensIn, tokensOut));

    const feat = safeKey(a.feature);
    const model = safeKey(a.model);
    const plan = safeKey(a.plan || "unknown");

    const inc = (n: number) => FieldValue.increment(n);

    await getAdminDb()
      .collection("aiUsage")
      .doc(dayKey())
      .set(
        {
          day: dayKey(),
          updatedAt: new Date().toISOString(),
          totalCost: inc(cost),
          totalCalls: inc(1),
          features: {
            [feat]: {
              cost: inc(cost),
              calls: inc(1),
              tokensIn: inc(tokensIn),
              tokensOut: inc(tokensOut),
              images: inc(images),
            },
          },
          models: { [model]: { cost: inc(cost), calls: inc(1) } },
          plans: { [plan]: { cost: inc(cost), calls: inc(1) } },
        },
        { merge: true },
      );
  } catch {
    // Telemetry is best-effort. Never let a logging failure surface to the user.
  }
}

/** Pull the completion usage block out of a raw OpenAI chat JSON response. */
export function usageFrom(
  data: unknown,
): { tokensIn: number; tokensOut: number } {
  const u = (data as { usage?: { prompt_tokens?: number; completion_tokens?: number } })?.usage;
  return {
    tokensIn: typeof u?.prompt_tokens === "number" ? u.prompt_tokens : 0,
    tokensOut: typeof u?.completion_tokens === "number" ? u.completion_tokens : 0,
  };
}
