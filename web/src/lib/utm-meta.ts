/**
 * Server side: turn a campaign tag into Stripe metadata (2026-10-19).
 *
 * Checkout sends the visitor's last tagged visit (lib/utm.ts
 * getCheckoutUtm). When it has none, the first-touch fields saved on
 * /users/{uid} at signup (notify-signup) are used instead. The result is
 * written to the subscription's metadata as utm_source / utm_medium /
 * utm_campaign / utm_content / utm_term (+ utm_from), so every trial in
 * Stripe says which link it came from. /api/admin/trial-sources reads it.
 */

export type UtmMeta = Record<string, string>;

const KEYS = ["source", "medium", "campaign", "content", "term"] as const;

function clean(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim().slice(0, 100);
  return s.length > 0 ? s : undefined;
}

/** Client payload ({source, medium, ...}) → metadata, or null when untagged. */
export function utmMetaFromClient(raw: unknown): UtmMeta | null {
  if (!raw || typeof raw !== "object") return null;
  const u = raw as Record<string, unknown>;
  const out: UtmMeta = {};
  for (const k of KEYS) {
    const v = clean(u[k]);
    if (v) out[`utm_${k}`] = v;
  }
  if (!out.utm_source && !out.utm_medium && !out.utm_campaign) return null;
  out.utm_from = "visit";
  return out;
}

/** First-touch fields on the user doc (utmSource, ...) → metadata, or null. */
export function utmMetaFromUserDoc(d: Record<string, unknown> | undefined): UtmMeta | null {
  if (!d) return null;
  const out: UtmMeta = {};
  const map: Record<(typeof KEYS)[number], string> = {
    source: "utmSource",
    medium: "utmMedium",
    campaign: "utmCampaign",
    content: "utmContent",
    term: "utmTerm",
  };
  for (const k of KEYS) {
    const v = clean(d[map[k]]);
    if (v) out[`utm_${k}`] = v;
  }
  if (!out.utm_source && !out.utm_medium && !out.utm_campaign) return null;
  out.utm_from = "signup";
  return out;
}
