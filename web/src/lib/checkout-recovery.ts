import type Stripe from "stripe";
import type { Auth } from "firebase-admin/auth";
import type { Firestore, DocumentData } from "firebase-admin/firestore";
import { subHasCard } from "@/lib/admin-revenue";
import { isInternalEmail } from "@/lib/internal-accounts";
import { isShabbatIL } from "@/lib/shabbat";
import { buildRecoveryEmail, recoveryPlanOf, type RecoveryPlan, type RecoveryStep } from "@/lib/email-drip/checkout-recovery-content";

/**
 * Abandoned-checkout recovery (Gadi 2026-10-21), shared by the cron
 * (/api/cron/checkout-recovery), the admin list, the daily digest and the
 * on-site "pick up where you left off" banner.
 *
 * Opening /checkout creates a Stripe subscription in "trialing" with no
 * payment method until the card is entered (api/subscribe). So an abandoned
 * checkout is: a trialing subscription with no card on it nor on its
 * customer (subHasCard), whose person has no other live carded subscription
 * and no paid plan, is not one of ours (@gadit.app), and is not a family
 * member (users/{uid}.familyId set and not their own uid). Emails start one
 * hour after the subscription was created.
 *
 * Ledger: checkoutRecovery/{subId} { uid, email, lang, priceId, plan,
 * createdMs, e1At, e2At, e3At (ms), convertedAt / closedAt, open }.
 * Kill switch: emailConfig/checkoutRecovery.enabled must be true to send.
 */

const H = 3_600_000;
export const RECOVERY_LEDGER = "checkoutRecovery";
export const RECOVERY_CONFIG_DOC = "emailConfig/checkoutRecovery";

/** E1 one hour after the checkout was opened, E2 after a day, E3 after three. */
export const STEP_AT_H: Record<RecoveryStep, number> = { 1: 1, 2: 24, 3: 72 };
/** At least this long between two emails of the series (a series that
 *  starts late, e.g. right after the switch is turned on, still spaces out). */
const MIN_GAP_H: Record<2 | 3, number> = { 2: 12, 3: 24 };
/** A checkout older than this when first seen gets no series at all. */
const MAX_START_AGE_H = 7 * 24;

export type Exclusion =
  | "internal"
  | "family_member"
  | "has_live_sub"
  | "paid_plan"
  | "older_duplicate"
  | "no_email"
  | "unsubscribed"
  | "suppressed";

/** Exclusions that mean "not an open abandoned checkout at all". The rest
 *  (internal, no email, unsubscribed) are still open, just never emailed. */
export const NOT_OPEN: Exclusion[] = ["family_member", "has_live_sub", "paid_plan", "older_duplicate"];

export type LedgerDoc = {
  uid: string;
  email: string;
  lang: string;
  priceId: string;
  plan?: RecoveryPlan;
  subId?: string;
  createdMs?: number;
  e1At?: number | null;
  e2At?: number | null;
  e3At?: number | null;
  convertedAt?: number | null;
  closedAt?: number | null;
  closedReason?: string;
  open?: boolean;
};

export type UserInfo = {
  doc?: DocumentData;
  email?: string | null;
  displayName?: string | null;
  phone?: string | null;
};

export type Candidate = {
  subId: string;
  customerId: string | null;
  uid: string;
  email: string | null;
  firstName: string | null;
  name: string | null;
  phone: string | null;
  lang: string;
  priceId: string;
  plan: RecoveryPlan;
  currency: string;
  createdMs: number;
  ageHours: number;
  internal: boolean;
  exclusion: Exclusion | null;
  ledger: LedgerDoc | null;
  /** The email this run would send, or null (not due yet / series done). */
  due: RecoveryStep | null;
};

const custIdOf = (s: Stripe.Subscription): string | null =>
  typeof s.customer === "string" ? s.customer : s.customer?.id ?? null;

function custObj(s: Stripe.Subscription): Stripe.Customer | null {
  const c = s.customer;
  if (c && typeof c === "object" && !("deleted" in c && c.deleted)) return c as Stripe.Customer;
  return null;
}

/** The uid behind a subscription: its own metadata, else its customer's. */
export function uidOf(s: Stripe.Subscription): string | null {
  const m = s.metadata?.uid;
  if (typeof m === "string" && m) return m;
  const cm = custObj(s)?.metadata?.uid;
  return typeof cm === "string" && cm ? cm : null;
}

/** A trialing subscription with no card anywhere: the checkout was never finished. */
export function isCardlessTrial(s: Stripe.Subscription): boolean {
  return s.status === "trialing" && !subHasCard(s);
}

/** A subscription that is (or will be) collecting money. */
function isLiveCarded(s: Stripe.Subscription): boolean {
  return s.status === "active" || s.status === "past_due" || (s.status === "trialing" && subHasCard(s));
}

/** Which email (if any) is due now for a checkout created at createdMs. */
export function dueStep(createdMs: number, ledger: LedgerDoc | null, now: number): RecoveryStep | null {
  const ageH = (now - createdMs) / H;
  const e1 = ledger?.e1At ?? null;
  const e2 = ledger?.e2At ?? null;
  const e3 = ledger?.e3At ?? null;
  if (!e1) return ageH >= STEP_AT_H[1] && ageH <= MAX_START_AGE_H ? 1 : null;
  if (!e2) return ageH >= STEP_AT_H[2] && (now - e1) / H >= MIN_GAP_H[2] ? 2 : null;
  if (!e3) return ageH >= STEP_AT_H[3] && (now - e2) / H >= MIN_GAP_H[3] ? 3 : null;
  return null;
}

/**
 * Pure selection: every card-less trial, classified. `subs` must hold every
 * live subscription (trialing, active, past_due); the trialing ones with
 * their customer expanded, so a card saved on the customer counts.
 */
export function classify(
  subs: Stripe.Subscription[],
  users: Map<string, UserInfo>,
  ledgers: Map<string, LedgerDoc>,
  now: number,
): Candidate[] {
  const liveCustomers = new Set<string>();
  const liveUids = new Set<string>();
  for (const s of subs) {
    if (!isLiveCarded(s)) continue;
    const c = custIdOf(s);
    if (c) liveCustomers.add(c);
    const u = uidOf(s);
    if (u) liveUids.add(u);
  }

  const out: Candidate[] = [];
  for (const s of subs) {
    if (!isCardlessTrial(s)) continue;
    const uid = uidOf(s);
    if (!uid) continue; // not one of ours to map to a person
    const info = users.get(uid) ?? {};
    const d = info.doc ?? {};
    const cust = custObj(s);
    const email = (typeof s.metadata?.email === "string" && s.metadata.email) || info.email || cust?.email || null;
    const name = info.displayName || (typeof d.displayName === "string" ? d.displayName.trim() : "") || cust?.name || null;
    const lang = (typeof s.metadata?.lang === "string" && s.metadata.lang) || (typeof d.uiLang === "string" && d.uiLang) || "en";
    const priceId = s.items.data[0]?.price?.id ?? "";
    const createdMs = s.created * 1000;
    const customerId = custIdOf(s);
    const internal = isInternalEmail(email);

    let exclusion: Exclusion | null = null;
    if (typeof d.familyId === "string" && d.familyId && d.familyId !== uid) exclusion = "family_member";
    else if (liveUids.has(uid) || (customerId && liveCustomers.has(customerId))) exclusion = "has_live_sub";
    else if (d.plan === "clear" || d.plan === "deep") exclusion = "paid_plan";
    else if (internal) exclusion = "internal";
    else if (!email) exclusion = "no_email";
    else if (d.emailSuppressed === true) exclusion = "suppressed";
    else if (d.dripUnsubscribed === true) exclusion = "unsubscribed";

    const ledger = ledgers.get(s.id) ?? null;
    out.push({
      subId: s.id,
      customerId,
      uid,
      email,
      firstName: name ? name.split(/\s+/)[0] || null : null,
      name,
      phone: info.phone || (typeof d.phone === "string" && d.phone) || (typeof d.phoneNumber === "string" && d.phoneNumber) || cust?.phone || null,
      lang,
      priceId,
      plan: recoveryPlanOf(priceId),
      currency: s.currency,
      createdMs,
      ageHours: Math.round(((now - createdMs) / H) * 10) / 10,
      internal,
      exclusion,
      ledger,
      due: null,
    });
  }

  // One series per person: the newest checkout wins (a person who tried two
  // plans gets mail about the last one only). Also one per email address.
  out.sort((a, b) => b.createdMs - a.createdMs);
  const seenUid = new Set<string>();
  const seenEmail = new Set<string>();
  for (const c of out) {
    if (NOT_OPEN.includes(c.exclusion as Exclusion)) continue;
    const em = c.email?.toLowerCase() ?? "";
    if (seenUid.has(c.uid) || (em && seenEmail.has(em))) { c.exclusion = "older_duplicate"; continue; }
    seenUid.add(c.uid);
    if (em) seenEmail.add(em);
  }
  for (const c of out) if (!c.exclusion && !c.ledger?.convertedAt && !c.ledger?.closedAt) c.due = dueStep(c.createdMs, c.ledger, now);
  return out;
}

/** Open abandoned checkouts (for the admin list, digest and banner). */
export function openCheckouts(cands: Candidate[]): Candidate[] {
  return cands.filter((c) => !NOT_OPEN.includes(c.exclusion as Exclusion));
}

// ---------------------------------------------------------------- I/O ----

async function listAll(stripe: Stripe, params: Stripe.SubscriptionListParams): Promise<Stripe.Subscription[]> {
  const out: Stripe.Subscription[] = [];
  let after: string | undefined;
  do {
    const page = await stripe.subscriptions.list({ ...params, limit: 100, ...(after ? { starting_after: after } : {}) });
    out.push(...page.data);
    after = page.has_more ? page.data[page.data.length - 1]?.id : undefined;
    if (out.length >= 3000) break;
  } while (after);
  return out;
}

/** Every live subscription: trialing (customer expanded) + active + past_due. */
export async function listLiveSubs(stripe: Stripe): Promise<Stripe.Subscription[]> {
  const [trialing, active, pastDue] = await Promise.all([
    listAll(stripe, { status: "trialing", expand: ["data.customer"] }),
    listAll(stripe, { status: "active" }),
    listAll(stripe, { status: "past_due" }),
  ]);
  return [...trialing, ...active, ...pastDue];
}

export async function collectAbandoned(
  stripe: Stripe,
  db: Firestore,
  auth: Auth,
  now = Date.now(),
): Promise<{ candidates: Candidate[]; scanned: number }> {
  const subs = await listLiveSubs(stripe);
  const cardless = subs.filter(isCardlessTrial);
  const uids = [...new Set(cardless.map(uidOf).filter((u): u is string => !!u))];

  const users = new Map<string, UserInfo>();
  for (let i = 0; i < uids.length; i += 100) {
    const chunk = uids.slice(i, i + 100);
    const [snaps, recs] = await Promise.all([
      db.getAll(...chunk.map((u) => db.collection("users").doc(u))),
      auth.getUsers(chunk.map((uid) => ({ uid }))).catch(() => ({ users: [] as { uid: string; email?: string; displayName?: string; phoneNumber?: string }[] })),
    ]);
    for (const snap of snaps) users.set(snap.id, { doc: snap.exists ? snap.data() : undefined });
    for (const r of recs.users) {
      const u = users.get(r.uid) ?? {};
      users.set(r.uid, { ...u, email: r.email ?? null, displayName: r.displayName?.trim() || null, phone: r.phoneNumber ?? null });
    }
  }

  const ledgers = new Map<string, LedgerDoc>();
  for (let i = 0; i < cardless.length; i += 100) {
    const snaps = await db.getAll(...cardless.slice(i, i + 100).map((s) => db.collection(RECOVERY_LEDGER).doc(s.id)));
    for (const snap of snaps) if (snap.exists) ledgers.set(snap.id, snap.data() as LedgerDoc);
  }

  return { candidates: classify(subs, users, ledgers, now), scanned: subs.length };
}

export async function recoveryEnabled(db: Firestore): Promise<boolean> {
  try {
    const snap = await db.doc(RECOVERY_CONFIG_DOC).get();
    return snap.exists && snap.data()?.enabled === true;
  } catch {
    return false;
  }
}

export type RunReport = {
  ok: true;
  dryRun: boolean;
  enabled: boolean;
  shabbat: boolean;
  scanned: number;
  open: number;
  sent: { subId: string; email: string; step: RecoveryStep }[];
  failed: { subId: string; email: string; step: RecoveryStep; reason: string }[];
  wouldSend: { subId: string; uid: string; email: string; name: string | null; lang: string; plan: RecoveryPlan; step: RecoveryStep; subject: string; ageHours: number; url: string }[];
  closed: { subId: string; result: "converted" | "closed" }[];
  excluded: { subId: string; email: string | null; reason: Exclusion }[];
};

type SendFn = (m: { to: string; subject: string; html: string }) => Promise<{ ok: true } | { ok: false; reason: string }>;

/** One cron run. Sends only when enabled, not a dry run and not Shabbat. */
export async function runCheckoutRecovery(opts: {
  stripe: Stripe;
  db: Firestore;
  auth: Auth;
  dryRun: boolean;
  send: SendFn;
  unsubUrl: (uid: string) => string;
  now?: number;
  sendCap?: number;
}): Promise<RunReport> {
  const now = opts.now ?? Date.now();
  const { db } = opts;
  const enabled = await recoveryEnabled(db);
  const shabbat = isShabbatIL(new Date(now));
  const live = enabled && !opts.dryRun && !shabbat;
  const cap = opts.sendCap ?? 40;

  const { candidates, scanned } = await collectAbandoned(opts.stripe, db, opts.auth, now);
  const report: RunReport = {
    ok: true, dryRun: opts.dryRun, enabled, shabbat, scanned,
    open: openCheckouts(candidates).filter((c) => !c.internal).length,
    sent: [], failed: [], wouldSend: [], closed: [],
    excluded: candidates.filter((c) => c.exclusion).map((c) => ({ subId: c.subId, email: c.email, reason: c.exclusion! })),
  };

  for (const c of candidates) {
    if (!c.due || !c.email) continue;
    const built = buildRecoveryEmail({ step: c.due, lang: c.lang, priceId: c.priceId, currency: c.currency, firstName: c.firstName, unsubscribeUrl: opts.unsubUrl(c.uid) });
    const url = built.html.match(/href="(https:\/\/gadit\.app\/[^"]+)"/)?.[1] ?? "";
    if (!live || report.sent.length >= cap) {
      report.wouldSend.push({ subId: c.subId, uid: c.uid, email: c.email, name: c.name, lang: c.lang, plan: c.plan, step: c.due, subject: built.subject, ageHours: c.ageHours, url: url.replace(/&amp;/g, "&") });
      continue;
    }
    const r = await opts.send({ to: c.email, subject: built.subject, html: built.html });
    if (!r.ok) { report.failed.push({ subId: c.subId, email: c.email, step: c.due, reason: r.reason }); continue; }
    report.sent.push({ subId: c.subId, email: c.email, step: c.due });
    await db.collection(RECOVERY_LEDGER).doc(c.subId).set(
      {
        uid: c.uid, email: c.email, lang: c.lang, priceId: c.priceId, plan: c.plan, subId: c.subId,
        createdMs: c.createdMs, open: true, [`e${c.due}At`]: now,
      },
      { merge: true },
    );
  }

  // Close ledger rows whose checkout is no longer abandoned: the card was
  // entered or the person subscribed another way (converted), or the
  // subscription is gone (canceled at trial end, or replaced).
  if (!opts.dryRun) {
    const stillOpen = new Set(openCheckouts(candidates).map((c) => c.subId));
    const snap = await db.collection(RECOVERY_LEDGER).where("open", "==", true).limit(500).get();
    for (const doc of snap.docs) {
      if (stillOpen.has(doc.id)) continue;
      const cand = candidates.find((c) => c.subId === doc.id);
      let converted = cand?.exclusion === "has_live_sub" || cand?.exclusion === "paid_plan";
      if (!cand) {
        try {
          const s = await opts.stripe.subscriptions.retrieve(doc.id, { expand: ["customer"] });
          converted = s.status === "active" || s.status === "past_due" || (s.status === "trialing" && subHasCard(s));
        } catch { /* gone */ }
      }
      await doc.ref.set(
        converted ? { open: false, convertedAt: now } : { open: false, closedAt: now, closedReason: cand?.exclusion ?? "not_open" },
        { merge: true },
      );
      report.closed.push({ subId: doc.id, result: converted ? "converted" : "closed" });
    }
  }
  return report;
}

/** The open checkout of one person, for the on-site banner. */
export async function pendingCheckoutFor(
  stripe: Stripe,
  db: Firestore,
  uid: string,
): Promise<{ priceId: string; plan: RecoveryPlan } | null> {
  const d = (await db.collection("users").doc(uid).get()).data() ?? {};
  if (typeof d.familyId === "string" && d.familyId && d.familyId !== uid) return null;
  if (d.plan === "clear" || d.plan === "deep") return null;
  const customer = typeof d.stripeCustomerId === "string" ? d.stripeCustomerId : null;
  if (!customer) return null;
  const [trialing, active, pastDue] = await Promise.all([
    stripe.subscriptions.list({ customer, status: "trialing", limit: 10, expand: ["data.customer"] }),
    stripe.subscriptions.list({ customer, status: "active", limit: 1 }),
    stripe.subscriptions.list({ customer, status: "past_due", limit: 1 }),
  ]);
  if (active.data.length || pastDue.data.length) return null;
  if (trialing.data.some((s) => subHasCard(s))) return null;
  const open = trialing.data
    .filter((s) => isCardlessTrial(s) && uidOf(s) === uid && s.items.data[0]?.price?.id)
    .sort((a, b) => b.created - a.created)[0];
  if (!open) return null;
  const priceId = open.items.data[0].price.id;
  return { priceId, plan: recoveryPlanOf(priceId) };
}
