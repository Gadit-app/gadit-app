import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import type { UserRecord } from "firebase-admin/auth";

/**
 * ADMIN, one-off backfill: give existing accounts a country (so the admin
 * users list shows a flag for everyone), for users who never got one because
 * they signed up before the country was persisted and never searched
 * themselves (Gadi 2026-08-17).
 *
 * Two accurate signals, in order:
 *   1. HOUSEHOLD — a family owner (uid === familyId) inherits the country
 *      already stamped on any of their members' usage docs
 *      (users/{familyId}_{memberId}.country, set when a kid searches from
 *      the same location). This covers Family subscribers who never look up
 *      words themselves.
 *   2. STRIPE — the customer's billing-address country, when present.
 *
 * Never guesses from language (a flag is a strong claim; a wrong one is
 * worse than none). Users with no signal stay uncountried and self-heal on
 * their next search via recordUserActivity.
 *
 * ALWAYS DRY-RUN FIRST: ?dryRun=1 writes nothing.
 *
 * USAGE:
 *   GET /api/admin/backfill-country?secret=$ADMIN_SECRET&dryRun=1
 *   GET /api/admin/backfill-country?secret=$ADMIN_SECRET
 */

export const maxDuration = 300;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";

  const auth = getAdminAuth();
  const db = getAdminDb();

  // 1) All Firebase Auth users.
  const allAuth: UserRecord[] = [];
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    allAuth.push(...page.users);
    pageToken = page.pageToken;
    if (allAuth.length >= 8000) break;
  } while (pageToken);

  // 2) Read every user doc (real + synthetic) so we can both find who is
  //    missing a country AND build the household country map.
  const allUids = allAuth.map((u) => u.uid);
  const docs = new Map<string, FirebaseFirestore.DocumentData>();
  const CHUNK = 300;
  for (let i = 0; i < allUids.length; i += CHUNK) {
    const refs = allUids.slice(i, i + CHUNK).map((uid) => db.collection("users").doc(uid));
    const snaps = await db.getAll(...refs);
    for (const s of snaps) if (s.exists) docs.set(s.id, s.data() ?? {});
  }

  // Household map: familyId -> country, from synthetic member usage docs.
  const householdCountry = new Map<string, string>();
  for (const [uid, d] of docs) {
    const sep = uid.indexOf("_");
    if (sep <= 0) continue; // not a synthetic member uid
    const c = (d.country as string | undefined)?.toUpperCase();
    if (c && c.length === 2 && !householdCountry.has(uid.slice(0, sep))) {
      householdCountry.set(uid.slice(0, sep), c);
    }
  }

  // 3) Real accounts (not synthetic) missing a country.
  const realUsers = allAuth.filter((u) => !u.uid.includes("_"));
  type Fix = { uid: string; email: string | null; country: string; source: "household" | "stripe" };
  const fixes: Fix[] = [];
  const stripeCandidates: Array<{ uid: string; email: string | null; customerId: string }> = [];

  for (const u of realUsers) {
    const d = docs.get(u.uid) ?? {};
    const existing = (d.country as string | undefined)?.trim();
    if (existing && existing.length === 2) continue; // already has a flag

    const hh = householdCountry.get(u.uid);
    if (hh) {
      fixes.push({ uid: u.uid, email: u.email ?? null, country: hh, source: "household" });
      continue;
    }
    const customerId = d.stripeCustomerId as string | undefined;
    if (customerId) stripeCandidates.push({ uid: u.uid, email: u.email ?? null, customerId });
  }

  // 4) Stripe billing country for the rest (bounded).
  for (const cand of stripeCandidates.slice(0, 400)) {
    try {
      const cust = await stripe.customers.retrieve(cand.customerId);
      if (cust && !("deleted" in cust)) {
        const c = (cust.address?.country || "").toUpperCase();
        if (c && c.length === 2) fixes.push({ uid: cand.uid, email: cand.email, country: c, source: "stripe" });
      }
    } catch { /* skip unresolvable customers */ }
  }

  const bySource = fixes.reduce((a, f) => { a[f.source] = (a[f.source] || 0) + 1; return a; }, {} as Record<string, number>);

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      realUsers: realUsers.length,
      missingBefore: realUsers.filter((u) => { const c = (docs.get(u.uid)?.country as string | undefined)?.trim(); return !(c && c.length === 2); }).length,
      wouldFill: fixes.length,
      bySource,
      stripeChecked: stripeCandidates.length,
      sample: fixes.slice(0, 20).map((f) => ({ email: f.email, country: f.country, source: f.source })),
    });
  }

  // 5) Write.
  let written = 0;
  for (const f of fixes) {
    try {
      await db.collection("users").doc(f.uid).set(
        { country: f.country, countryUpdatedAt: FieldValue.serverTimestamp(), countrySource: f.source },
        { merge: true },
      );
      written++;
    } catch { /* skip */ }
  }

  return NextResponse.json({ dryRun: false, realUsers: realUsers.length, filled: written, bySource });
}
