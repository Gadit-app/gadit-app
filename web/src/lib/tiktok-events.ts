import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { TIKTOK_PIXEL_ID } from "@/lib/tiktok-config";

/**
 * TikTok Events API v1.3 (server side). The server copy of the browser pixel's
 * conversions (lib/tiktok-pixel.ts), sent with the SAME event_id so TikTok
 * keeps one of the two:
 *   CompleteRegistration `reg_<uid>`      from /api/notify-signup
 *   StartTrial `trial_<uid>` and Purchase `purchase_<invoiceId>` from the Stripe webhook
 * Off unless TIKTOK_EVENTS_API_TOKEN is set. Always best-effort: short timeout,
 * never throws, so a conversion report can never break signup or the webhook.
 * Each event_id is sent once (guard doc tiktokEvents/<event_id>), since Stripe
 * delivers invoice.paid AND invoice.payment_succeeded and retries webhooks.
 */

const ENDPOINT = "https://business-api.tiktok.com/open_api/v1.3/event/track/";
const TIMEOUT_MS = 4000;

export function tiktokEventsEnabled(): boolean {
  return !!process.env.TIKTOK_EVENTS_API_TOKEN;
}

/** The browser facts TikTok matches on, read from a request the adult made. */
export type TikTokContext = {
  ip?: string;
  userAgent?: string;
  ttp?: string; // the pixel's _ttp cookie
  ttclid?: string; // TikTok click id (gadit_ttclid cookie, or ?ttclid= on the page)
  url?: string; // page the adult was on
  referrer?: string;
};

function sha256(v: string): string {
  return createHash("sha256").update(v.trim().toLowerCase()).digest("hex");
}

function cookie(req: NextRequest, name: string): string | undefined {
  try {
    return req.cookies.get(name)?.value || undefined;
  } catch {
    return undefined;
  }
}

/** IP, UA, _ttp, ttclid and page from the adult's own request (not Stripe's). */
export function tiktokContextFromRequest(req: NextRequest): TikTokContext {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined;
  const url = req.headers.get("referer") ?? undefined;
  let ttclid: string | undefined;
  try {
    ttclid = url ? new URL(url).searchParams.get("ttclid") ?? undefined : undefined;
  } catch {
    /* ignore */
  }
  const ctx: TikTokContext = {
    ip,
    userAgent: req.headers.get("user-agent") ?? undefined,
    ttp: cookie(req, "_ttp"),
    // components/TikTokPixel.tsx keeps the ad click id in a first-party cookie.
    ttclid: ttclid ?? cookie(req, "gadit_ttclid"),
    url,
  };
  // Firestore never accepts undefined values (the webhook reads this back).
  return Object.fromEntries(Object.entries(ctx).filter(([, v]) => !!v)) as TikTokContext;
}

const ZERO_DECIMAL = new Set(["bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf"]);

/** Stripe minor units → a decimal value TikTok expects. */
export function stripeAmountToValue(amount: number, currency: string): number {
  return ZERO_DECIMAL.has(currency.toLowerCase()) ? amount : Math.round(amount) / 100;
}

export type TikTokServerEvent = {
  event: "CompleteRegistration" | "Purchase" | "InitiateCheckout" | "StartTrial";
  eventId: string;
  uid?: string;
  email?: string;
  ctx?: TikTokContext;
  properties?: Record<string, unknown>;
};

/** Send one event. Resolves to true when TikTok accepted it. Never throws. */
export async function sendTikTokEvent(e: TikTokServerEvent): Promise<boolean> {
  const token = process.env.TIKTOK_EVENTS_API_TOKEN;
  if (!token || !e.eventId) return false;

  // Once per event_id, ever.
  const guard = getAdminDb().doc(`tiktokEvents/${e.eventId.replace(/\//g, "_")}`);
  try {
    await guard.create({ event: e.event, uid: e.uid ?? null, at: new Date() });
  } catch {
    return false; // already sent (or Firestore down: skip rather than double count)
  }

  const ctx = e.ctx ?? {};
  const user: Record<string, string> = {};
  if (e.uid) user.external_id = sha256(e.uid);
  if (e.email) user.email = sha256(e.email);
  if (ctx.ttclid) user.ttclid = ctx.ttclid;
  if (ctx.ttp) user.ttp = ctx.ttp;
  if (ctx.ip) user.ip = ctx.ip;
  if (ctx.userAgent) user.user_agent = ctx.userAgent;

  const data: Record<string, unknown> = {
    event: e.event,
    event_time: Math.floor(Date.now() / 1000),
    event_id: e.eventId,
    user,
    properties: e.properties ?? {},
  };
  if (ctx.url) data.page = { url: ctx.url, ...(ctx.referrer ? { referrer: ctx.referrer } : {}) };

  const body: Record<string, unknown> = {
    event_source: "web",
    event_source_id: TIKTOK_PIXEL_ID,
    data: [data],
  };
  // Optional: shows the events under "Test events" in TikTok Events Manager.
  if (process.env.TIKTOK_EVENTS_TEST_CODE) body.test_event_code = process.env.TIKTOK_EVENTS_TEST_CODE;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Access-Token": token, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const json = (await res.json().catch(() => ({}))) as { code?: number; message?: string };
    if (!res.ok || (json.code ?? 0) !== 0) {
      console.error("[tiktok-events] rejected", e.event, e.eventId, res.status, json.code, json.message);
      await guard.delete().catch(() => {}); // allow a later retry
      return false;
    }
    return true;
  } catch (err) {
    console.error("[tiktok-events] send failed", e.event, e.eventId, (err as Error)?.message);
    await guard.delete().catch(() => {});
    return false;
  }
}
