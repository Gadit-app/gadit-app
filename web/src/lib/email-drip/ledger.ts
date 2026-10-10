import { FAMILY_META, FAMILY_LABEL_HE } from "./family-content";
import { INDIV_META, INDIV_LABEL_HE, INDIV_SERIES_LIVE } from "./indiv-content";
import { SCHOOL_DRIP, SCHOOL_SERIES_LIVE, SCHOOL_SERIES_FROM } from "./school-drip";

/**
 * Shared vocabulary of the /admin/emails ledger (Gadi 2026-10-10): which
 * Firestore stamp belongs to which series, the readable he/en label of each
 * mail, and the series' live state. Server side only for the values (it
 * pulls in the content modules); the client imports the TYPES alone.
 *
 * Stamps on users/{uid} (verified in the code that writes them):
 *   dripSent.<key>        signup series, key "<step>-<lang>" (33 langs, a
 *                         language without content falls back to "-en");
 *                         value { sentAt, messageId } or { skippedAt }
 *   familyDripSent.<key>  Family series fam2-*, same value shape
 *   indivDripSent.<key>   Individual series ind-*, same value shape
 *   schoolDripSent.<key>  school pilot sch-*, { sentAt } or { skippedAt }
 *   loginReminderSentAt   Firestore Timestamp
 *   trialReminderAt       Firestore Timestamp (+ trialReminderFor = trialEnd)
 *   playUpgradeSentAt     Firestore Timestamp
 *   familyWelcomeSentAt   ISO string (+ familyWelcomeSent: true)
 *   dunningNotifiedInvoice  Stripe invoice id string, no timestamp
 *   dunningReminderInvoice  Stripe invoice id string, no timestamp (day-5)
 */

export type LedgerSeries = "signup" | "family" | "individual" | "school" | "reminders";
export const LEDGER_SERIES: LedgerSeries[] = ["signup", "family", "individual", "school", "reminders"];

export type LedgerSend = {
  series: LedgerSeries;
  /** Mail key without its language suffix ("welcome", "fam2-start", "login-reminder"). */
  key: string;
  /** The full stored key ("welcome-he"). */
  rawKey: string;
  lang: string | null;
  /** ISO time of the send; null when the stamp carries no time. */
  at: string | null;
  /** at is derived (payment email: from the grace window), not stamped. */
  approx?: boolean;
  /** Stamped as skipped (stale), never actually sent. */
  skipped?: boolean;
};

export type LedgerUserRow = {
  uid: string;
  email: string | null;
  internal: boolean;
  createdAt: string | null;
  docLang: string | null;
  notifiedSignupAt: string | null;
  sends: LedgerSend[];
};

export type LedgerSeriesInfo = {
  id: LedgerSeries;
  live: boolean;
  /** Only accounts opened from this date enter the series. */
  from?: string;
  /** Mail keys in series order (current keys, then legacy ones). */
  order: string[];
  /** Keys found in the data that the series no longer has (older versions). */
  legacy: string[];
  usersReached: number;
  sends: number;
  sends7d: number;
  skipped: number;
  lastSentAt: string | null;
};

export type LedgerKeyCount = { total: number; byLang: Record<string, number> };

export type LedgerResponse = {
  generatedAt: string;
  series: LedgerSeriesInfo[];
  /** series -> key -> he/en label. */
  labels: Record<LedgerSeries, Record<string, { he: string; en: string }>>;
  counts: {
    usersWithEmails: number;
    totalSends: number;
    sentLast7Days: number;
    internalUsers: number;
    /** series -> key -> counts (internal accounts excluded). */
    perKey: Record<LedgerSeries, Record<string, LedgerKeyCount>>;
    funnel: Array<{ step: string; he: number; en: number; other: number; total: number }>;
  };
  users: LedgerUserRow[];
};

export const SIGNUP_STEPS = ["welcome", "meanings", "etymology", "visual", "summary"] as const;

export const REMINDER_KEYS = [
  "login-reminder",
  "trial-reminder",
  "play-upgrade",
  "family-welcome",
  "payment-failed",
  "payment-reminder",
] as const;

const SIGNUP_LABELS: Record<string, { he: string; en: string }> = {
  welcome: { he: "ברוכים הבאים (יום 0)", en: "Welcome (day 0)" },
  meanings: { he: "משמעויות (יום 2)", en: "Meanings (day 2)" },
  etymology: { he: "אטימולוגיה (יום 5)", en: "Etymology (day 5)" },
  visual: { he: "ויזואלי (יום 9)", en: "Visual (day 9)" },
  summary: { he: "סיכום (יום 14)", en: "Summary (day 14)" },
};

const REMINDER_LABELS: Record<string, { he: string; en: string }> = {
  "login-reminder": { he: "תזכורת כניסה", en: "Login reminder" },
  "trial-reminder": { he: "תזכורת סוף ניסיון", en: "Trial ending reminder" },
  "play-upgrade": { he: "שדרוג ממשתמש Play", en: "Play app upgrade" },
  "family-welcome": { he: "ברוכים הבאים ל-Family", en: "Family welcome" },
  "payment-failed": { he: "בעיה בתשלום", en: "Payment problem" },
  "payment-reminder": { he: "תזכורת תשלום (יום 5)", en: "Payment reminder (day 5)" },
};

/** "Family · 3 · The notebook" -> "3 · The notebook". */
function stripSeriesPrefix(label: string): string {
  const i = label.indexOf(" · ");
  return i >= 0 ? label.slice(i + 3) : label;
}

export function ledgerLabels(): LedgerResponse["labels"] {
  const family: Record<string, { he: string; en: string }> = {};
  for (const m of FAMILY_META) family[m.key] = { he: FAMILY_LABEL_HE[m.key] ?? stripSeriesPrefix(m.label), en: stripSeriesPrefix(m.label) };
  const individual: Record<string, { he: string; en: string }> = {};
  for (const m of INDIV_META) individual[m.key] = { he: INDIV_LABEL_HE[m.key] ?? stripSeriesPrefix(m.label), en: stripSeriesPrefix(m.label) };
  const school: Record<string, { he: string; en: string }> = {};
  SCHOOL_DRIP.forEach((m, i) => {
    school[m.key] = { he: `${i + 1} · ${m.he.subject}`, en: `${i + 1} · ${m.en.subject}` };
  });
  return { signup: { ...SIGNUP_LABELS }, family, individual, school, reminders: { ...REMINDER_LABELS } };
}

export function ledgerSeriesConfig(): Record<LedgerSeries, { live: boolean; from?: string; order: string[] }> {
  return {
    signup: { live: true, order: [...SIGNUP_STEPS] },
    family: { live: true, order: FAMILY_META.map((m) => m.key) },
    individual: { live: INDIV_SERIES_LIVE, order: INDIV_META.map((m) => m.key) },
    school: { live: SCHOOL_SERIES_LIVE, from: SCHOOL_SERIES_FROM, order: SCHOOL_DRIP.map((m) => m.key) },
    reminders: { live: true, order: [...REMINDER_KEYS] },
  };
}

/** Readable fallback for a key no content module knows ("fam-tap-word" -> "Tap word"). */
export function humanizeKey(key: string): string {
  const s = key.replace(/^(fam2|fam|ind|sch)-/, "").replace(/[-_]+/g, " ").trim();
  return s ? s[0].toUpperCase() + s.slice(1) : key;
}
