import crypto from "node:crypto";
import type { Lang } from "@/lib/i18n";
import { buildI18nDrip } from "./build-i18n-drip";
import { welcomeHe } from "./mail-1-welcome-he";
import { meaningsHe } from "./mail-2-meanings-he";
import { etymologyHe } from "./mail-3-etymology-he";
import { visualHe } from "./mail-4-visual-he";
import { summaryHe } from "./mail-5-summary-he";
import { welcomeEn } from "./mail-1-welcome-en";
import { meaningsEn } from "./mail-2-meanings-en";
import { etymologyEn } from "./mail-3-etymology-en";
import { visualEn } from "./mail-4-visual-en";
import { summaryEn } from "./mail-5-summary-en";

/**
 * Drip-sequence registry. Adding a new mail = add an entry here and
 * a matching template file. Days are RELATIVE to signup (day 0 = the
 * moment the user signed up).
 *
 * The `key` is the stable identifier persisted on the user doc so we
 * can dedupe: once a mail with a given key has been sent to a user,
 * it never sends again.
 *
 * Schedule:
 *   day  0: welcome — sent immediately by /api/notify-signup
 *   day  2: meanings
 *   day  5: etymology
 *   day  9: visual (kids mode + image)
 *   day 14: summary + upgrade CTA
 *
 * English templates will share the same keys with -en suffix, so the
 * dedupe field stores e.g. "welcome-he" or "welcome-en" depending on
 * which language the user falls under.
 */

export type DripLang = "he" | "en";

export type DripMail = {
  /** Stable identifier persisted as the dedupe key on /users/{uid}.dripSent.<key>=true */
  key: string;
  /** Day-since-signup at which to fire (0 = immediate via signup hook) */
  dayOffset: number;
  /** Builder that returns { subject, preheader, html } */
  build(opts: { displayName?: string; unsubscribeUrl: string }): {
    subject: string;
    preheader: string;
    html: string;
  };
};

export const HE_DRIP: DripMail[] = [
  { key: "welcome-he",    dayOffset: 0,  build: welcomeHe },
  { key: "meanings-he",   dayOffset: 2,  build: meaningsHe },
  { key: "etymology-he",  dayOffset: 5,  build: etymologyHe },
  { key: "visual-he",     dayOffset: 9,  build: visualHe },
  { key: "summary-he",    dayOffset: 14, build: summaryHe },
];

export const EN_DRIP: DripMail[] = [
  { key: "welcome-en",    dayOffset: 0,  build: welcomeEn },
  { key: "meanings-en",   dayOffset: 2,  build: meaningsEn },
  { key: "etymology-en",  dayOffset: 5,  build: etymologyEn },
  { key: "visual-en",     dayOffset: 9,  build: visualEn },
  { key: "summary-en",    dayOffset: 14, build: summaryEn },
];

/**
 * Resolve the drip series for a user's language. Hebrew and English keep their
 * original hand-written files; every other language routes through the
 * data-driven i18n drip (build-i18n-drip.ts), falling back to English until
 * that language's content is authored. Accepts any string (the raw uiLang).
 */
export function getDripForLang(lang: string): DripMail[] {
  if (lang === "he") return HE_DRIP;
  if (lang === "en") return EN_DRIP;
  return buildI18nDrip(lang as Lang) ?? EN_DRIP;
}

const UNSUB_SECRET_FALLBACK = "gadit-unsub-fallback-do-not-rely";

/**
 * One-shot HMAC token for one-click unsubscribe. The link a user
 * receives in their email is /api/email/unsubscribe?uid=<uid>&t=<token>;
 * the server recomputes the token with EMAIL_UNSUB_SECRET and accepts
 * the request only on match. Stateless (no random token to store) and
 * unforgeable without the env secret.
 */
export function makeUnsubToken(uid: string): string {
  const secret = process.env.EMAIL_UNSUB_SECRET || UNSUB_SECRET_FALLBACK;
  return crypto.createHmac("sha256", secret).update(uid).digest("hex").slice(0, 24);
}

export function verifyUnsubToken(uid: string, token: string): boolean {
  const expected = makeUnsubToken(uid);
  if (expected.length !== token.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

export function buildUnsubUrl(uid: string): string {
  return `https://www.gadit.app/api/email/unsubscribe?uid=${encodeURIComponent(uid)}&t=${makeUnsubToken(uid)}`;
}
