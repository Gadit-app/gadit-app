import { getAdminDb } from "./firebase-admin";

// Known crawler / script user-agents. A real browser always sends a rich UA;
// a missing UA is almost always a script, so we treat that as a bot too. This
// is how the activity log tells apart real humans from search-engine crawlers
// walking the public per-language word URLs.
const BOT_UA =
  /bot|crawl|spider|slurp|mediapartners|bingpreview|facebookexternalhit|whatsapp|telegram|discordbot|yandex|baiduspider|duckduckbot|semrush|ahrefs|mj12bot|dotbot|petalbot|applebot|headless|phantomjs|python-requests|python-urllib|curl\/|wget|axios\/|node-fetch|go-http-client|java\/|okhttp|scrapy/i;

export function isBotUA(ua: string | null | undefined): boolean {
  if (!ua || ua.trim().length < 8) return true; // no/absurdly-short UA = script
  return BOT_UA.test(ua);
}

/**
 * activity-log.ts — a raw, per-event feed of what happens in the app, so
 * /admin/activity can show a live log (newest first): time, word or image,
 * language, and WHICH subscriber did it. This is different from
 * `wordSearches` (an aggregated per-word counter) — here every single event
 * is its own row, so Gadi can watch the app second by second.
 *
 * One auto-id doc per event in `activityLog`:
 *   { kind: "word" | "image", word, lang, uid, plan, atMs, at }
 * `atMs` (epoch ms) is the sort + pagination key; `at` is a human ISO string.
 * `uid` is null for anonymous (not-signed-in) visitors; the email is resolved
 * at read time from the users collection so we don't duplicate PII per row.
 *
 * Fire-and-forget: callers `void recordActivity(...)` and never await it, and
 * every failure is swallowed so logging never blocks a user's request.
 */
export async function recordActivity(e: {
  kind: "word" | "image";
  word: string;
  lang: string;
  uid?: string | null;
  plan?: string | null;
  /** 2-letter country from the request (Vercel x-vercel-ip-country). Lets an
   *  anonymous row still say WHERE it came from. */
  country?: string | null;
  /** Raw request user-agent, used to flag crawlers so the log can show only
   *  real humans by default. */
  ua?: string | null;
}): Promise<void> {
  try {
    const word = (e.word || "").trim().slice(0, 120);
    if (!word) return;
    const country = (e.country || "").trim().slice(0, 2).toUpperCase() || null;
    await getAdminDb().collection("activityLog").add({
      kind: e.kind,
      word,
      lang: e.lang || "en",
      uid: e.uid ?? null,
      plan: e.plan ?? (e.uid ? "unknown" : "anon"),
      country,
      ua: (e.ua || "").slice(0, 200) || null,
      isBot: isBotUA(e.ua),
      atMs: Date.now(),
      at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[recordActivity] failed:", String(err));
  }
}
