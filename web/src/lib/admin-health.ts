import Stripe from "stripe";
import type { DocumentData, Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import { internalUids } from "./internal-accounts";
import { INDIVIDUAL_PRICE_IDS } from "./individual-prices";
import { NEW_SCHOOLS_PRICE_IDS } from "./schools-prices";
import { applyDiscounts, subHasCard } from "./admin-revenue";

/**
 * Subscriber health (Gadi 2026-10-21): every paying or trialing subscriber,
 * one row per customer (a family = the owner plus every member account),
 * placed in one of four segments by when anyone in it last used Gadit:
 *
 *   A active   usage in the last 7 days
 *   B fading   last usage 8 to 30 days ago
 *   C dormant  used before, nothing in 30+ days
 *   D never    zero searches ever and an empty notebook
 *
 * Usage = activityLog rows (searches and pictures, summed `count`), the
 * users doc's lastSearchAt, and practice days (users.practiceCount). Opening
 * the app alone (lastSeenAt) is shown but does not count as usage.
 *
 * Money comes live from Stripe: the next charge is trial_end while trialing,
 * else the item's current_period_end; the amount is the price in the
 * subscription's OWN currency (Hebrew subscribers pay ILS through a
 * currency_option on a USD price), after recurring coupons.
 *
 * Read only. Shared by /api/admin/health.
 */

export type HealthSegment = "A" | "B" | "C" | "D";
export type HealthKind = "family" | "individual" | "schools" | "legacy";

export type HealthRow = {
  uid: string;
  email: string | null;
  name: string | null;
  kind: HealthKind;
  status: string;
  /** Family profiles with role boy / girl. */
  kids: number;
  /** All family profiles (parents and kids). */
  members: number;
  /** Member accounts attached to the family (excluding the owner). */
  memberAccounts: number;
  c7: number;
  c30: number;
  searchesEver: number;
  notebook: number;
  lastUseMs: number | null;
  daysSinceUse: number | null;
  lastSeenMs: number | null;
  segment: HealthSegment;
  /** The next charge; null when the subscription is set to cancel. */
  nextChargeMs: number | null;
  /** When a scheduled cancellation ends the subscription. */
  endsMs: number | null;
  /** One invoice, native currency. */
  amount: number | null;
  currency: string | null;
  billing: "monthly" | "yearly" | null;
  /** Monthly value in USD (yearly / 12), at today's rate. */
  monthlyUsd: number;
  cancelAtPeriodEnd: boolean;
  hasCard: boolean | null;
  paused: boolean;
  utmCampaign: string | null;
  signupMs: number | null;
  signupDays: number | null;
  stripeCustomerId: string | null;
};

export type HealthSegmentSummary = {
  count: number;
  paying: number;
  trialing: number;
  /** Paying (active + past_due, not paused) monthly USD. */
  payingMonthlyUsd: number;
  /** Trialing with a card, monthly USD if they convert. */
  trialMonthlyUsd: number;
  share: number;
};

export type HealthReport = {
  generatedAt: string;
  fx: { ilsPerUsd: number; source: "live" | "fallback" };
  total: number;
  segments: Record<HealthSegment, HealthSegmentSummary>;
  rows: HealthRow[];
};

const DAY = 86_400_000;
const LIVE = ["active", "trialing", "past_due"];

// Fallback rates (USD per unit), the same locked table as admin-revenue.ts.
const FALLBACK_USD_PER: Record<string, number> = { usd: 1, ils: 0.323, eur: 1.08, gbp: 1.27, zar: 0.055 };

async function loadFx(): Promise<{ usdPer: Record<string, number>; ilsPerUsd: number; source: "live" | "fallback" }> {
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(4000), cache: "no-store" });
    if (!r.ok) throw new Error(String(r.status));
    const j = (await r.json()) as { rates?: Record<string, number> };
    const rates = j.rates ?? {};
    const ils = rates.ILS;
    if (!(typeof ils === "number" && ils > 1 && ils < 10)) throw new Error("bad ILS rate");
    const usdPer: Record<string, number> = { ...FALLBACK_USD_PER };
    for (const [k, v] of Object.entries(rates)) if (typeof v === "number" && v > 0) usdPer[k.toLowerCase()] = 1 / v;
    return { usdPer, ilsPerUsd: ils, source: "live" };
  } catch {
    return { usdPer: FALLBACK_USD_PER, ilsPerUsd: Math.round((1 / FALLBACK_USD_PER.ils) * 100) / 100, source: "fallback" };
  }
}

function toMs(v: unknown): number | null {
  if (!v) return null;
  if (typeof v === "object" && v !== null && "toMillis" in v && typeof (v as { toMillis: () => number }).toMillis === "function") {
    return (v as { toMillis: () => number }).toMillis();
  }
  if (v instanceof Date) return v.getTime();
  if (typeof v === "number") return v;
  if (typeof v === "string") { const t = Date.parse(v); return Number.isFinite(t) ? t : null; }
  return null;
}

/** Latest practice day from users.practiceCount ({ "YYYY-MM-DD": n }), as noon UTC of that day. */
function lastPracticeMs(pc: unknown, now: number): number | null {
  if (!pc || typeof pc !== "object") return null;
  let best: number | null = null;
  for (const [day, n] of Object.entries(pc as Record<string, unknown>)) {
    if (!(typeof n === "number" && n > 0)) continue;
    const t = Date.parse(`${day}T12:00:00Z`);
    if (!Number.isFinite(t)) continue;
    const c = Math.min(t, now);
    if (best == null || c > best) best = c;
  }
  return best;
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

/** Coupons on a subscription: discounts[].source.coupon (expanded), plus the
 *  legacy discount.coupon shape for older objects. */
function subCoupons(sub: Stripe.Subscription): Stripe.Coupon[] {
  const out: Stripe.Coupon[] = [];
  const isCoupon = (c: unknown): c is Stripe.Coupon => !!c && typeof c === "object" && "id" in c && "duration" in c;
  const raw = sub as unknown as { discount?: { coupon?: unknown } | null; discounts?: unknown[] };
  if (isCoupon(raw.discount?.coupon)) out.push(raw.discount.coupon);
  for (const d of raw.discounts ?? []) {
    if (!d || typeof d !== "object") continue;
    const dd = d as { coupon?: unknown; source?: { coupon?: unknown } };
    const c = dd.source?.coupon ?? dd.coupon;
    if (isCoupon(c) && !out.some((x) => x.id === c.id)) out.push(c);
  }
  return out;
}

const STATUS_RANK: Record<string, number> = { active: 3, past_due: 2, trialing: 1 };

async function listLiveSubs(stripe: Stripe): Promise<Stripe.Subscription[]> {
  const out: Stripe.Subscription[] = [];
  await Promise.all(
    (["active", "trialing", "past_due"] as const).map(async (status) => {
      let startingAfter: string | undefined;
      let guard = 0;
      do {
        const page = await stripe.subscriptions.list({
          status,
          limit: 100,
          // The coupon sits at discounts[].source.coupon on this API version
          // (the old sub.discount.coupon is gone), so it must be expanded.
          expand: ["data.customer", "data.discounts.source.coupon"],
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        });
        out.push(...page.data);
        startingAfter = page.has_more ? page.data[page.data.length - 1]?.id : undefined;
      } while (startingAfter && ++guard < 20);
    }),
  );
  return out;
}

export async function buildHealthReport(db: Firestore, auth: Auth, stripe: Stripe): Promise<HealthReport> {
  const now = Date.now();

  // ---- Stripe + FX in parallel with the Firestore reads ----
  const stripeP = listLiveSubs(stripe);
  const fxP = loadFx();

  // ---- 1) Subscriber docs ----
  const subSnap = await db.collection("users").where("subscriptionStatus", "in", LIVE).get();
  const candidates = subSnap.docs.map((d) => ({ uid: d.id, d: d.data() as DocumentData }));

  // Auth records (email, name, creation time), 100 per call.
  const authById = new Map<string, { email: string | null; name: string | null; createdMs: number | null }>();
  for (const part of chunk(candidates.filter((c) => !c.uid.includes("_")), 100)) {
    const res = await auth.getUsers(part.map((c) => ({ uid: c.uid })));
    for (const u of res.users) {
      authById.set(u.uid, {
        email: u.email ?? null,
        name: u.displayName?.trim() || null,
        createdMs: u.metadata.creationTime ? Date.parse(u.metadata.creationTime) : null,
      });
    }
  }
  const emailOf = (c: { uid: string; d: DocumentData }) =>
    authById.get(c.uid)?.email ?? (typeof c.d.email === "string" ? (c.d.email as string) : null);

  const internal = internalUids(candidates.map((c) => ({ uid: c.uid, email: emailOf(c), familyId: c.d.familyId, schoolId: c.d.schoolId })));

  const subs = await stripeP;
  const subByCustomer = new Map<string, Stripe.Subscription>();
  const subByUid = new Map<string, Stripe.Subscription>();
  const better = (a: Stripe.Subscription | undefined, b: Stripe.Subscription) =>
    !a || (STATUS_RANK[b.status] ?? 0) > (STATUS_RANK[a.status] ?? 0) || ((STATUS_RANK[b.status] ?? 0) === (STATUS_RANK[a.status] ?? 0) && b.created > a.created);
  for (const s of subs) {
    const cid = typeof s.customer === "string" ? s.customer : s.customer?.id;
    if (cid && better(subByCustomer.get(cid), s)) subByCustomer.set(cid, s);
    const muid = typeof s.metadata?.uid === "string" ? s.metadata.uid : typeof s.metadata?.userId === "string" ? s.metadata.userId : null;
    if (muid && better(subByUid.get(muid), s)) subByUid.set(muid, s);
  }
  const subFor = (uid: string, d: DocumentData): Stripe.Subscription | null => {
    const cid = typeof d.stripeCustomerId === "string" ? d.stripeCustomerId : null;
    return (cid ? subByCustomer.get(cid) : undefined) ?? subByUid.get(uid) ?? null;
  };

  // Owners only: family members count under the owner, school members under
  // the school (unless they hold their own subscription), comp and internal
  // accounts never count.
  const owners = candidates.filter((c) => {
    if (c.uid.includes("_")) return false;
    if (internal.has(c.uid)) return false;
    if (c.d.comp === true) return false;
    const fam = typeof c.d.familyId === "string" && c.d.familyId ? (c.d.familyId as string) : null;
    if (fam && fam !== c.uid) return false;
    const school = typeof c.d.schoolId === "string" && c.d.schoolId ? (c.d.schoolId as string) : null;
    if (school && school !== c.uid && !subFor(c.uid, c.d)) return false;
    return true;
  });

  // ---- 2) Families: member accounts + member profiles ----
  const familyOwners = owners.filter((o) => o.d.familyId === o.uid).map((o) => o.uid);
  const memberDocs = new Map<string, DocumentData>(); // uid -> users doc
  const memberUidsByOwner = new Map<string, Set<string>>();
  const profilesByOwner = new Map<string, Array<{ role?: unknown; userId?: unknown }>>();
  await Promise.all([
    ...chunk(familyOwners, 30).map(async (part) => {
      const snap = await db.collection("users").where("familyId", "in", part).get();
      for (const doc of snap.docs) {
        const fam = doc.get("familyId") as string;
        if (doc.id === fam) continue;
        memberDocs.set(doc.id, doc.data());
        if (!memberUidsByOwner.has(fam)) memberUidsByOwner.set(fam, new Set());
        memberUidsByOwner.get(fam)!.add(doc.id);
      }
    }),
    ...familyOwners.map(async (uid) => {
      const snap = await db.collection("families").doc(uid).collection("members").select("role", "userId").get();
      profilesByOwner.set(uid, snap.docs.map((m) => m.data()));
    }),
  ]);
  // Paired profiles whose account was not caught by the familyId query.
  const missing: string[] = [];
  for (const [owner, profiles] of profilesByOwner) {
    for (const p of profiles) {
      const u = typeof p.userId === "string" ? p.userId : null;
      if (!u || u === owner) continue;
      if (!memberUidsByOwner.has(owner)) memberUidsByOwner.set(owner, new Set());
      memberUidsByOwner.get(owner)!.add(u);
      if (!memberDocs.has(u)) missing.push(u);
    }
  }
  for (const part of chunk([...new Set(missing)], 300)) {
    const snaps = await db.getAll(...part.map((u) => db.collection("users").doc(u)));
    for (const s of snaps) if (s.exists) memberDocs.set(s.id, s.data() ?? {});
  }

  // Every uid whose usage counts for each owner.
  const uidsOf = new Map<string, string[]>();
  for (const o of owners) uidsOf.set(o.uid, [o.uid, ...(memberUidsByOwner.get(o.uid) ?? [])]);
  const allUids = new Set<string>();
  for (const list of uidsOf.values()) for (const u of list) allUids.add(u);

  // ---- 3) Activity, one query over 60 days ----
  const since60 = now - 60 * DAY;
  const since30 = now - 30 * DAY;
  const since7 = now - 7 * DAY;
  const act = new Map<string, { c7: number; c30: number; last: number }>();
  const actSnap = await db.collection("activityLog").where("atMs", ">=", since60).select("uid", "atMs", "count").get();
  for (const doc of actSnap.docs) {
    const uid = doc.get("uid");
    if (typeof uid !== "string" || !allUids.has(uid)) continue;
    const at = Number(doc.get("atMs")) || 0;
    const n = Number(doc.get("count")) || 1;
    const cur = act.get(uid) ?? { c7: 0, c30: 0, last: 0 };
    if (at >= since7) cur.c7 += n;
    if (at >= since30) cur.c30 += n;
    if (at > cur.last) cur.last = at;
    act.set(uid, cur);
  }

  // ---- 4) Notebook sizes (count aggregation per uid) ----
  const nb = new Map<string, number>();
  for (const part of chunk([...allUids], 40)) {
    await Promise.all(part.map(async (u) => {
      try {
        const c = await db.collection("users").doc(u).collection("notebook").count().get();
        nb.set(u, c.data().count);
      } catch { nb.set(u, 0); }
    }));
  }

  const fx = await fxP;
  const toUsd = (amount: number, cur: string) => amount * (fx.usdPer[cur.toLowerCase()] ?? 1);

  // Prices with their currency options (the ILS amount lives there).
  const priceIds = new Set<string>();
  for (const o of owners) {
    const s = subFor(o.uid, o.d);
    for (const it of s?.items.data ?? []) if (it.price?.id) priceIds.add(it.price.id);
  }
  const prices = new Map<string, Stripe.Price>();
  await Promise.all([...priceIds].map(async (id) => {
    try { prices.set(id, await stripe.prices.retrieve(id, { expand: ["currency_options"] })); } catch { /* fall back to the item's price */ }
  }));

  // ---- 5) Rows ----
  const rows: HealthRow[] = owners.map((o) => {
    const d = o.d;
    const uids = uidsOf.get(o.uid) ?? [o.uid];
    const docOf = (u: string) => (u === o.uid ? d : memberDocs.get(u) ?? {});

    let c7 = 0, c30 = 0, last: number | null = null, searchesEver = 0, notebook = 0, lastSeen: number | null = null;
    const bump = (t: number | null) => { if (t != null && (last == null || t > last)) last = t; };
    for (const u of uids) {
      const a = act.get(u);
      if (a) { c7 += a.c7; c30 += a.c30; bump(a.last || null); }
      const ud = docOf(u);
      if (typeof ud.searchCount === "number") searchesEver += ud.searchCount;
      bump(toMs(ud.lastSearchAt));
      bump(lastPracticeMs(ud.practiceCount, now));
      notebook += nb.get(u) ?? 0;
      const seen = toMs(ud.lastSeenAt);
      if (seen != null && (lastSeen == null || seen > lastSeen)) lastSeen = seen;
    }
    const lastUse = last as number | null;
    const daysSinceUse = lastUse != null ? Math.max(0, Math.floor((now - lastUse) / DAY)) : null;
    const segment: HealthSegment =
      daysSinceUse != null && daysSinceUse <= 7 ? "A" :
      daysSinceUse != null && daysSinceUse <= 30 ? "B" :
      daysSinceUse != null || searchesEver > 0 || notebook > 0 ? "C" : "D";

    const profiles = profilesByOwner.get(o.uid) ?? [];
    const kids = profiles.filter((p) => p.role === "boy" || p.role === "girl").length;

    // Stripe money
    const s = subFor(o.uid, d);
    let nextChargeMs: number | null = null;
    let endsMs: number | null = null;
    const cancelling = !!s?.cancel_at_period_end || !!s?.cancel_at;
    let amount: number | null = null;
    let currency: string | null = null;
    let billing: "monthly" | "yearly" | null = null;
    let monthlyUsd = 0;
    let hasCard: boolean | null = null;
    let primaryPriceId: string | null = null;
    if (s) {
      currency = (s.currency || s.items.data[0]?.price?.currency || "usd").toLowerCase();
      const item0 = s.items.data[0] as (Stripe.SubscriptionItem & { current_period_end?: number }) | undefined;
      primaryPriceId = item0?.price?.id ?? null;
      const periodEndMs = s.status === "trialing" && s.trial_end ? s.trial_end * 1000 : item0?.current_period_end ? item0.current_period_end * 1000 : null;
      // A subscription set to cancel charges nothing more: it just ends.
      if (cancelling) endsMs = s.cancel_at ? s.cancel_at * 1000 : periodEndMs;
      else nextChargeMs = periodEndMs;
      const interval = item0?.price?.recurring?.interval;
      const months = (item0?.price?.recurring?.interval_count ?? 1) * (interval === "year" ? 12 : interval === "month" ? 1 : NaN);
      billing = interval === "year" ? "yearly" : interval === "month" ? "monthly" : null;
      let invoice = 0;
      for (const it of s.items.data) {
        const p = prices.get(it.price?.id ?? "") ?? it.price;
        const opt = currency && p?.currency !== currency ? p?.currency_options?.[currency]?.unit_amount : null;
        const unit = opt ?? (p?.currency === currency ? p?.unit_amount : null) ?? p?.unit_amount ?? 0;
        invoice += (unit * (it.quantity ?? 1)) / 100;
      }
      const coupons = subCoupons(s);
      if (Number.isFinite(months) && months > 0) {
        const monthlyNative = applyDiscounts(invoice / months, months, coupons);
        monthlyUsd = Math.round(toUsd(monthlyNative, currency) * 100) / 100;
        // The next invoice: recurring coupons, plus a one-time coupon on a
        // trial's first invoice.
        let next = monthlyNative * months;
        if (s.status === "trialing") {
          for (const c of coupons) {
            if (c.duration !== "once") continue;
            if (typeof c.percent_off === "number" && c.percent_off > 0) next *= 1 - c.percent_off / 100;
            if (typeof c.amount_off === "number" && c.amount_off > 0) next = Math.max(0, next - c.amount_off / 100);
          }
        }
        amount = Math.round(next * 100) / 100;
      } else {
        amount = Math.round(invoice * 100) / 100;
      }
      if (s.status === "trialing") hasCard = subHasCard(s);
    }

    const kind: HealthKind =
      typeof d.schoolId === "string" && d.schoolId === o.uid ? "schools" :
      d.familyId ? "family" :
      primaryPriceId && NEW_SCHOOLS_PRICE_IDS.includes(primaryPriceId) ? "schools" :
      primaryPriceId && INDIVIDUAL_PRICE_IDS.includes(primaryPriceId) ? "individual" :
      "legacy";

    const a = authById.get(o.uid);
    const cust = s && typeof s.customer === "object" && s.customer && !("deleted" in s.customer && s.customer.deleted) ? (s.customer as Stripe.Customer) : null;
    const name =
      a?.name ||
      (typeof d.displayName === "string" && d.displayName.trim()) ||
      (typeof d.name === "string" && d.name.trim()) ||
      cust?.name ||
      null;
    const signupMs = a?.createdMs ?? toMs(d.createdAt);
    const status = s?.status ?? (typeof d.subscriptionStatus === "string" ? d.subscriptionStatus : "unknown");

    return {
      uid: o.uid,
      email: emailOf(o),
      name: name || null,
      kind,
      status,
      kids,
      members: profiles.length,
      memberAccounts: uids.length - 1,
      c7,
      c30,
      searchesEver,
      notebook,
      lastUseMs: lastUse,
      daysSinceUse,
      lastSeenMs: lastSeen,
      segment,
      nextChargeMs,
      endsMs,
      amount,
      currency,
      billing,
      monthlyUsd,
      cancelAtPeriodEnd: cancelling,
      hasCard,
      paused: !!s?.pause_collection,
      utmCampaign: typeof d.utmCampaign === "string" && d.utmCampaign ? d.utmCampaign : null,
      signupMs,
      signupDays: signupMs != null ? Math.max(0, Math.floor((now - signupMs) / DAY)) : null,
      stripeCustomerId: typeof d.stripeCustomerId === "string" ? d.stripeCustomerId : cust?.id ?? null,
    };
  });

  rows.sort((x, y) => (x.nextChargeMs ?? Infinity) - (y.nextChargeMs ?? Infinity));

  const empty = (): HealthSegmentSummary => ({ count: 0, paying: 0, trialing: 0, payingMonthlyUsd: 0, trialMonthlyUsd: 0, share: 0 });
  const segments: Record<HealthSegment, HealthSegmentSummary> = { A: empty(), B: empty(), C: empty(), D: empty() };
  for (const r of rows) {
    const g = segments[r.segment];
    g.count += 1;
    if (r.status === "trialing") {
      g.trialing += 1;
      if (r.hasCard !== false) g.trialMonthlyUsd += r.monthlyUsd;
    } else {
      g.paying += 1;
      if (!r.paused) g.payingMonthlyUsd += r.monthlyUsd;
    }
  }
  for (const g of Object.values(segments)) {
    g.payingMonthlyUsd = Math.round(g.payingMonthlyUsd * 100) / 100;
    g.trialMonthlyUsd = Math.round(g.trialMonthlyUsd * 100) / 100;
    g.share = rows.length ? Math.round((g.count / rows.length) * 1000) / 10 : 0;
  }

  return {
    generatedAt: new Date(now).toISOString(),
    fx: { ilsPerUsd: Math.round(fx.ilsPerUsd * 1000) / 1000, source: fx.source },
    total: rows.length,
    segments,
    rows,
  };
}
