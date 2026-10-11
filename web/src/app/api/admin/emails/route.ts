import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { LANGUAGES } from "@/lib/i18n";
import { isInternalEmail } from "@/lib/internal-accounts";
import { schoolLang } from "@/lib/email-drip/school-drip";
import { dunningLang } from "@/lib/dunning-email";
import {
  LEDGER_SERIES,
  SIGNUP_STEPS,
  humanizeKey,
  ledgerLabels,
  ledgerSeriesConfig,
  type LedgerKeyCount,
  type LedgerResponse,
  type LedgerSend,
  type LedgerSeries,
  type LedgerSeriesInfo,
  type LedgerUserRow,
} from "@/lib/email-drip/ledger";

/**
 * Admin — email delivery ledger for /admin/emails.
 *
 * Source of truth is OUR Firestore data, not Resend: every automated email
 * leaves a stamp on the user doc (that stamp is also its duplicate-send
 * guard). Resend's own dashboard only keeps a short window; this ledger is
 * permanent. Gadi 2026-07-08; widened 2026-10-10 from the signup series
 * alone to every series that sends today (Family, Individual, schools and
 * the one-off reminders). The stamp shapes are listed in
 * lib/email-drip/ledger.ts.
 *
 * Internal accounts (lib/internal-accounts) are listed, flagged internal,
 * and left out of every count.
 *
 * Auth: same ADMIN_SECRET query-param gate as every /api/admin route.
 */

export const maxDuration = 60;

const DAY = 86_400_000;
const GRACE_MS = 7 * DAY; // webhook: graceUntil = failed invoice date + 7 days

// Longest first so "zh-CN" wins over any shorter code.
const LANG_CODES = LANGUAGES.map((l) => l.code as string).sort((a, b) => b.length - a.length);

function splitLang(rawKey: string): { key: string; lang: string | null } {
  for (const code of LANG_CODES) {
    const suffix = `-${code}`;
    if (rawKey.endsWith(suffix) && rawKey.length > suffix.length) return { key: rawKey.slice(0, -suffix.length), lang: code };
  }
  return { key: rawKey, lang: null };
}

function tsToIso(v: unknown): string | null {
  if (!v) return null;
  if (typeof v === "object" && v !== null && "toDate" in v && typeof (v as { toDate: () => Date }).toDate === "function") {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "number") return new Date(v).toISOString();
  if (typeof v === "string") return v;
  return null;
}

/** One entry of a <series>DripSent map: { sentAt, messageId } | { skippedAt } | true (old). */
function readMapEntry(v: unknown): { sent: boolean; at: string | null } {
  if (v === true) return { sent: true, at: null };
  if (v && typeof v === "object") {
    const o = v as { sentAt?: unknown; skippedAt?: unknown };
    if (o.sentAt) return { sent: true, at: tsToIso(o.sentAt) };
    if (o.skippedAt) return { sent: false, at: tsToIso(o.skippedAt) };
  }
  return { sent: false, at: null };
}

function docLangOf(d: FirebaseFirestore.DocumentData): string | null {
  if (typeof d.uiLang === "string" && d.uiLang) return d.uiLang;
  if (typeof d.dripLang === "string" && d.dripLang) return d.dripLang;
  if (d.country === "IL") return "he";
  return null;
}

const MAP_FIELDS: Array<[string, LedgerSeries]> = [
  ["dripSent", "signup"],
  ["familyDripSent", "family"],
  ["indivDripSent", "individual"],
  ["schoolDripSent", "school"],
];

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "ADMIN_SECRET env var not configured, refusing to run" }, { status: 503 });
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = getAdminDb();
  // One collection scan (map fields can't be filtered server-side without an
  // index per key; at our size a full scan is cheap).
  const [snap, schoolsSnap] = await Promise.all([
    db
      .collection("users")
      .select(
        "email", "createdAt", "notifiedSignupAt", "uiLang", "dripLang", "country",
        "dripSent", "familyDripSent", "indivDripSent", "schoolDripSent",
        "loginReminderSentAt", "trialReminderAt", "playUpgradeSentAt",
        "familyWelcomeSent", "familyWelcomeSentAt",
        "dunningNotifiedInvoice", "dunningReminderInvoice", "graceUntil",
      )
      .limit(20000)
      .get(),
    db.collection("schools").select("curriculum").get(),
  ]);
  const curriculumBySchool = new Map<string, string | undefined>();
  for (const s of schoolsSnap.docs) curriculumBySchool.set(s.id, s.data().curriculum as string | undefined);

  const users: LedgerUserRow[] = [];
  for (const doc of snap.docs) {
    const d = doc.data();
    const docLang = docLangOf(d);
    const sends: LedgerSend[] = [];

    for (const [field, series] of MAP_FIELDS) {
      const map = d[field] as Record<string, unknown> | undefined;
      if (!map || typeof map !== "object") continue;
      for (const rawKey of Object.keys(map)) {
        const e = readMapEntry(map[rawKey]);
        if (!e.sent && !e.at) continue;
        const { key, lang } = splitLang(rawKey);
        const lng =
          lang ?? (series === "school" ? schoolLang(curriculumBySchool.get(doc.id)) : docLang);
        sends.push({ series, key, rawKey, lang: lng, at: e.at, ...(e.sent ? {} : { skipped: true }) });
      }
    }

    const heOrEn = docLang === "he" ? "he" : "en";
    const one = (key: string, at: string | null, lang: string | null, extra: Partial<LedgerSend> = {}) =>
      sends.push({ series: "reminders", key, rawKey: key, lang, at, ...extra });
    if (d.loginReminderSentAt) one("login-reminder", tsToIso(d.loginReminderSentAt), docLang ?? "en");
    if (d.trialReminderAt) one("trial-reminder", tsToIso(d.trialReminderAt), docLang ?? "en");
    if (d.playUpgradeSentAt) one("play-upgrade", tsToIso(d.playUpgradeSentAt), docLang ?? "en");
    if (d.familyWelcomeSentAt || d.familyWelcomeSent === true) one("family-welcome", tsToIso(d.familyWelcomeSentAt), heOrEn);
    if (typeof d.dunningNotifiedInvoice === "string" && d.dunningNotifiedInvoice) {
      // No time is stamped; while a grace window is open it dates the failure.
      const grace = typeof d.graceUntil === "number" ? d.graceUntil : null;
      one(
        "payment-failed",
        grace ? new Date(grace - GRACE_MS).toISOString() : null,
        dunningLang(d, {}),
        grace ? { approx: true } : {},
      );
    }
    if (typeof d.dunningReminderInvoice === "string" && d.dunningReminderInvoice) {
      one("payment-reminder", null, dunningLang(d, {}));
    }

    if (!sends.some((s) => !s.skipped)) continue; // only people who actually got an email
    sends.sort((a, b) => (b.at ?? "").localeCompare(a.at ?? ""));
    const email = typeof d.email === "string" && d.email ? d.email : null;
    users.push({
      uid: doc.id,
      email,
      internal: false,
      createdAt: tsToIso(d.createdAt),
      docLang,
      notifiedSignupAt: tsToIso(d.notifiedSignupAt),
      sends,
    });
  }

  // Some user docs carry no email; take it from Auth (also needed to spot
  // internal accounts).
  const auth = getAdminAuth();
  const missing = users.filter((u) => !u.email);
  for (let i = 0; i < missing.length; i += 100) {
    const chunk = missing.slice(i, i + 100);
    try {
      const res = await auth.getUsers(chunk.map((u) => ({ uid: u.uid })));
      const byUid = new Map(res.users.map((r) => [r.uid, r.email ?? null]));
      for (const u of chunk) u.email = byUid.get(u.uid) ?? null;
    } catch {
      /* listing still works without these emails */
    }
  }
  for (const u of users) u.internal = isInternalEmail(u.email);

  // ── Aggregates (internal accounts excluded) ──
  const now = Date.now();
  const config = ledgerSeriesConfig();
  const perKey = Object.fromEntries(LEDGER_SERIES.map((s) => [s, {} as Record<string, LedgerKeyCount>])) as Record<
    LedgerSeries,
    Record<string, LedgerKeyCount>
  >;
  const seriesInfo = new Map<LedgerSeries, LedgerSeriesInfo>(
    LEDGER_SERIES.map((s) => [
      s,
      { id: s, live: config[s].live, from: config[s].from, order: [...config[s].order], legacy: [], usersReached: 0, sends: 0, sends7d: 0, skipped: 0, lastSentAt: null },
    ]),
  );
  let totalSends = 0;
  let sentLast7Days = 0;
  let usersWithEmails = 0;

  for (const u of users) {
    if (u.internal) continue;
    usersWithEmails++;
    const reached = new Set<LedgerSeries>();
    for (const s of u.sends) {
      const info = seriesInfo.get(s.series)!;
      if (s.skipped) {
        info.skipped++;
        continue;
      }
      reached.add(s.series);
      info.sends++;
      totalSends++;
      if (s.at && now - Date.parse(s.at) < 7 * DAY) {
        info.sends7d++;
        sentLast7Days++;
      }
      if (s.at && !s.approx && (!info.lastSentAt || s.at > info.lastSentAt)) info.lastSentAt = s.at;
      const kc = (perKey[s.series][s.key] ??= { total: 0, byLang: {} });
      kc.total++;
      const l = s.lang ?? "?";
      kc.byLang[l] = (kc.byLang[l] ?? 0) + 1;
    }
    for (const r of reached) seriesInfo.get(r)!.usersReached++;
  }

  // Keys found in the data that the content modules no longer list (older
  // series) go after the known ones, with a humanized label.
  const labels = ledgerLabels();
  for (const u of users) {
    for (const s of u.sends) {
      const info = seriesInfo.get(s.series)!;
      if (!info.order.includes(s.key)) {
        info.order.push(s.key);
        info.legacy.push(s.key);
      }
      if (!labels[s.series][s.key]) {
        const h = humanizeKey(s.key);
        labels[s.series][s.key] = { he: `ישן · ${h}`, en: `old · ${h}` };
      }
    }
  }

  // Signup funnel, every language: he / en / other / total per step.
  const funnel = SIGNUP_STEPS.map((step) => {
    const by = perKey.signup[step]?.byLang ?? {};
    const he = by.he ?? 0;
    const en = by.en ?? 0;
    const total = perKey.signup[step]?.total ?? 0;
    return { step, he, en, other: total - he - en, total };
  });

  // Most recent sends first.
  const lastOf = (u: LedgerUserRow) => u.sends.find((s) => s.at && !s.skipped)?.at ?? "";
  users.sort((a, b) => lastOf(b).localeCompare(lastOf(a)));

  const body: LedgerResponse = {
    generatedAt: new Date(now).toISOString(),
    series: LEDGER_SERIES.map((s) => seriesInfo.get(s)!),
    labels,
    counts: {
      usersWithEmails,
      totalSends,
      sentLast7Days,
      internalUsers: users.filter((u) => u.internal).length,
      perKey,
      funnel,
    },
    users,
  };
  return NextResponse.json(body);
}
