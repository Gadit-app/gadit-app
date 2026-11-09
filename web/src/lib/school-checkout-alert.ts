import type Stripe from "stripe";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";
import { isInternalEmail } from "@/lib/internal-accounts";
import { schoolsTierForPrice } from "@/lib/schools-prices";

/**
 * An alert to Gadi when someone starts buying a school plan and stops
 * (Gadi 2026-11-09, after Diana opened the $97 checkout and left with no
 * trace but a "New signup" mail).
 *
 * School plans are bought only on the hosted Stripe Checkout page (never a
 * card-less trial, see api/subscribe), and every such session carries
 * metadata.isSchools = "1" (api/create-checkout). So: a school session that
 * is still open or has expired 30 minutes after it was opened, whose person
 * has not completed another school session and is not a school account
 * already, is an abandoned school purchase. One alert per person per day,
 * ledger schoolCheckoutAlerts/{sessionId}.
 *
 * Internal mail to Gadi only, so it is not held for Shabbat.
 */

const MIN = 60_000;
/** How long after opening the Stripe page a session counts as abandoned. */
export const ABANDON_AFTER_MIN = 30;
/** Sessions older than this are not looked at (Stripe keeps them 24h open). */
const LOOKBACK_H = 48;
const LEDGER = "schoolCheckoutAlerts";

export type SchoolAlert = {
  sessionId: string;
  uid: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  lang: string | null;
  country: string | null;
  partner: string | null;
  tier: string;
  amount: string;
  priceId: string;
  status: string;
  startedMs: number;
  minutesAgo: number;
  attempts: number;
  utm: string | null;
};

export type SchoolAlertReport = {
  ok: true;
  dryRun: boolean;
  scanned: number;
  alerts: SchoolAlert[];
  skipped: { sessionId: string; reason: string }[];
};

type Mail = { subject: string; html: string; replyTo?: string };
type SendFn = (m: Mail) => Promise<boolean>;

async function listSchoolSessions(stripe: Stripe, sinceSec: number): Promise<Stripe.Checkout.Session[]> {
  const out: Stripe.Checkout.Session[] = [];
  let after: string | undefined;
  do {
    const page = await stripe.checkout.sessions.list({
      created: { gte: sinceSec },
      limit: 100,
      ...(after ? { starting_after: after } : {}),
    });
    for (const s of page.data) if (s.metadata?.isSchools === "1" && s.mode === "subscription") out.push(s);
    after = page.has_more ? page.data[page.data.length - 1]?.id : undefined;
    if (out.length >= 500) break;
  } while (after);
  return out;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function tierLabel(priceId: string): { tier: string; amount: string } {
  const t = schoolsTierForPrice(priceId);
  if (!t) return { tier: "Schools (older price)", amount: "" };
  const yearly = t.yearly === priceId;
  const size = { s: "S, up to 100 students", m: "M, up to 500 students", l: "L, up to 1,000 students" }[t.key];
  return { tier: `${size}, ${yearly ? "yearly" : "monthly"}`, amount: yearly ? t.usdYearly : t.usdMonthly };
}

export function alertMail(a: SchoolAlert): { subject: string; html: string } {
  const who = a.name || a.email || a.uid;
  const ago = a.minutesAgo < 120 ? `${a.minutesAgo} minutes` : `${Math.round(a.minutesAgo / 60)} hours`;
  // Hebrew and Arabic schools buy through the pilot / order form, not Stripe.
  const resume = a.lang === "he" || a.lang === "ar"
    ? `https://gadit.app/${a.lang}/schools/landing#order`
    : `https://gadit.app${a.lang && a.lang !== "en" ? `/${a.lang}` : ""}/checkout?price=${encodeURIComponent(a.priceId)}`;
  const row = (k: string, v: string | null) => `<b>${k}:</b> ${v ? esc(v) : "(none)"}<br/>`;
  return {
    subject: `🏫 School checkout NOT finished: ${who}`,
    html: `<p>Someone opened the Stripe payment page for a school plan ${ago} ago and has not paid.${a.attempts > 1 ? ` They opened it ${a.attempts} times.` : ""}</p>
<p>${row("Name", a.name)}${row("Email", a.email)}${row("Phone", a.phone)}${row("Plan", `${a.tier}${a.amount ? ` (${a.amount})` : ""}`)}${row("Page language", a.lang)}${row("Country", a.country)}${row("Came through partner", a.partner)}${row("Campaign", a.utm)}${row("Stripe page", a.status === "expired" ? "expired" : "still open")}</p>
<p>Reply to this email to write to them directly.<br/>
${a.lang === "he" || a.lang === "ar" ? "The order form in their language:" : "The link that takes them back to the same plan:"} <a href="${resume}">${esc(resume)}</a></p>
<p style="color:#777;font-size:12px">uid ${esc(a.uid)}, Stripe session ${esc(a.sessionId)}. One alert per person per day.</p>`,
  };
}

export async function runSchoolCheckoutAlert(opts: {
  stripe: Stripe;
  db: Firestore;
  auth: Auth;
  dryRun: boolean;
  send: SendFn;
  now?: number;
}): Promise<SchoolAlertReport> {
  const now = opts.now ?? Date.now();
  const { db } = opts;
  const sessions = await listSchoolSessions(opts.stripe, Math.floor((now - LOOKBACK_H * 3_600_000) / 1000));
  const report: SchoolAlertReport = { ok: true, dryRun: opts.dryRun, scanned: sessions.length, alerts: [], skipped: [] };

  // Per person: their sessions, newest first.
  const byUid = new Map<string, Stripe.Checkout.Session[]>();
  for (const s of sessions) {
    const uid = s.client_reference_id || s.metadata?.userId;
    if (!uid) { report.skipped.push({ sessionId: s.id, reason: "no_uid" }); continue; }
    byUid.set(uid, [...(byUid.get(uid) ?? []), s]);
  }

  for (const [uid, list] of byUid) {
    list.sort((a, b) => b.created - a.created);
    const newest = list[0];
    if (list.some((s) => s.status === "complete")) { report.skipped.push({ sessionId: newest.id, reason: "paid" }); continue; }
    const ageMin = Math.floor((now - newest.created * 1000) / MIN);
    if (ageMin < ABANDON_AFTER_MIN) { report.skipped.push({ sessionId: newest.id, reason: "too_new" }); continue; }

    // Already alerted about this person in the last day (any of their sessions)?
    const snaps = await db.getAll(...list.map((s) => db.collection(LEDGER).doc(s.id)));
    const lastAlert = Math.max(0, ...snaps.map((d) => Number(d.get("alertedAt") ?? 0)));
    if (now - lastAlert < 24 * 3_600_000) { report.skipped.push({ sessionId: newest.id, reason: "alerted" }); continue; }

    const [udoc, urec] = await Promise.all([
      db.collection("users").doc(uid).get(),
      opts.auth.getUser(uid).catch(() => null),
    ]);
    const d = udoc.data() ?? {};
    if (d.schoolId === uid || d.isDemo === true) { report.skipped.push({ sessionId: newest.id, reason: "school_account" }); continue; }
    const email = newest.customer_details?.email || newest.customer_email || urec?.email || null;
    if (isInternalEmail(email)) { report.skipped.push({ sessionId: newest.id, reason: "internal" }); continue; }

    const priceId = newest.line_items?.data[0]?.price?.id
      ?? (await opts.stripe.checkout.sessions.listLineItems(newest.id, { limit: 1 }).catch(() => null))?.data[0]?.price?.id
      ?? "";
    const { tier, amount } = tierLabel(priceId);
    const m = newest.metadata ?? {};
    const utm = [m.utm_source, m.utm_medium, m.utm_campaign].filter(Boolean).join(" / ") || null;
    const alert: SchoolAlert = {
      sessionId: newest.id,
      uid,
      email,
      name: newest.customer_details?.name || urec?.displayName || (typeof d.displayName === "string" ? d.displayName : null) || null,
      phone: newest.customer_details?.phone || urec?.phoneNumber || (typeof d.phone === "string" ? d.phone : null) || null,
      lang: m.lang || (typeof d.uiLang === "string" ? d.uiLang : null),
      country: newest.customer_details?.address?.country || (typeof d.country === "string" ? d.country : null),
      partner: typeof d.referredBy === "string" ? d.referredBy : null,
      tier,
      amount,
      priceId,
      status: newest.status ?? "open",
      startedMs: newest.created * 1000,
      minutesAgo: ageMin,
      attempts: list.length,
      utm,
    };
    report.alerts.push(alert);
    if (opts.dryRun) continue;

    const mail = alertMail(alert);
    const sent = await opts.send({ ...mail, ...(email ? { replyTo: email } : {}) });
    if (!sent) continue;
    await db.collection(LEDGER).doc(newest.id).set({ uid, email, priceId, alertedAt: now }, { merge: true });
  }
  return report;
}
