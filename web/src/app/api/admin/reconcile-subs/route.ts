import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Admin tool — reconcile every user's Firestore subscription fields with
 * STRIPE (the source of truth). Fixes count drift in /api/admin/overview,
 * whose MRR / activeSubscriptions numbers key on `users/{uid}.subscriptionStatus`.
 *
 * WHY THIS EXISTS (Reut incident, 2026-07-23): a paying subscriber can end
 * up with `familyId` set but `subscriptionStatus` NOT active/trialing when a
 * canceled DUPLICATE sub's `customer.subscription.deleted` writes
 * `subscriptionStatus: "canceled"` after the real sub already activated. The
 * doc then reads as "not paying" even though Stripe has a live sub, so the
 * dashboard undercounts. This endpoint re-derives the truth from Stripe.
 *
 * This runs ON VERCEL, where FIREBASE_SERVICE_ACCOUNT is present, so it can
 * both READ and WRITE Firestore (the local machine cannot — that var is
 * marked sensitive and pulls empty).
 *
 * PASS A (undercount fix): list every live Stripe sub (active + trialing).
 *   For each BILLABLE one (active, or trialing WITH a card — a card-less
 *   trial is an abandoned checkout that auto-cancels, so it must not count),
 *   write the correct plan / subscriptionStatus / familyId / schoolId to the
 *   owner's doc. Newest sub wins if a user somehow has two.
 * PASS B (overcount fix): any doc still marked active/trialing whose owner
 *   has NO live billable sub in Stripe is downgraded to basic/canceled.
 *
 * USAGE:
 *   POST /api/admin/reconcile-subs?secret=$ADMIN_SECRET       (writes)
 *   POST /api/admin/reconcile-subs?secret=$ADMIN_SECRET&dryRun=1  (report only)
 *
 * Idempotent: safe to re-run. Only writes docs that actually differ.
 */

export const maxDuration = 60;

// Kept in sync with web/src/app/api/webhook/route.ts.
const LEGACY_FAMILY_PRICE_IDS = [
  "price_1TqqNWRprLKxF6OiZAzFpn35", // Family monthly $6.99 (retired)
  "price_1TqqNXRprLKxF6Oi700Vbwxv", // Family yearly $69 (retired)
];

function getPlanFromPriceId(priceId: string): "basic" | "clear" | "deep" {
  const map: Record<string, "basic" | "clear" | "deep"> = {
    [process.env.STRIPE_PRICE_CLEAR_MONTHLY!]: "clear",
    [process.env.STRIPE_PRICE_CLEAR_YEARLY!]: "clear",
    [process.env.STRIPE_PRICE_DEEP_MONTHLY!]: "deep",
    [process.env.STRIPE_PRICE_DEEP_YEARLY!]: "deep",
    [process.env.STRIPE_PRICE_FAMILY_MONTHLY!]: "deep",
    [process.env.STRIPE_PRICE_FAMILY_YEARLY!]: "deep",
    [process.env.STRIPE_PRICE_SCHOOLS_MONTHLY!]: "deep",
    [process.env.STRIPE_PRICE_SCHOOLS_YEARLY!]: "deep",
    [process.env.STRIPE_PRICE_SCHOOLS_MEDIUM_MONTHLY!]: "deep",
    [process.env.STRIPE_PRICE_SCHOOLS_MEDIUM_YEARLY!]: "deep",
    [process.env.STRIPE_PRICE_SCHOOLS_LARGE_MONTHLY!]: "deep",
    [process.env.STRIPE_PRICE_SCHOOLS_LARGE_YEARLY!]: "deep",
  };
  if (LEGACY_FAMILY_PRICE_IDS.includes(priceId)) return "deep";
  return map[priceId] ?? "basic";
}

function isFamilyPriceId(priceId: string): boolean {
  return (
    priceId === process.env.STRIPE_PRICE_FAMILY_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_FAMILY_YEARLY ||
    LEGACY_FAMILY_PRICE_IDS.includes(priceId)
  );
}

function isSchoolsPriceId(priceId: string): boolean {
  return (
    priceId === process.env.STRIPE_PRICE_SCHOOLS_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_SCHOOLS_YEARLY ||
    priceId === process.env.STRIPE_PRICE_SCHOOLS_MEDIUM_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_SCHOOLS_MEDIUM_YEARLY ||
    priceId === process.env.STRIPE_PRICE_SCHOOLS_LARGE_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_SCHOOLS_LARGE_YEARLY
  );
}

type Row = {
  uid: string;
  subId: string;
  plan: string;
  status: string;
  was: { plan?: string; status?: string };
  changed: boolean;
};

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_SECRET env var not configured, refusing to run" },
      { status: 503 },
    );
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const db = getAdminDb();

  // ---------- PASS A: Stripe live subs -> fix docs ----------
  const liveSubs: Stripe.Subscription[] = [];
  for (const status of ["active", "trialing"] as const) {
    let startingAfter: string | undefined;
    do {
      const page: Stripe.ApiList<Stripe.Subscription> = await stripe.subscriptions.list({
        status,
        limit: 100,
        ...(startingAfter && { starting_after: startingAfter }),
      });
      liveSubs.push(...page.data);
      startingAfter = page.has_more ? page.data[page.data.length - 1]?.id : undefined;
    } while (startingAfter);
  }

  // Oldest first so the NEWEST billable sub is written last and wins when a
  // user has more than one live sub during a plan switch.
  liveSubs.sort((a, b) => a.created - b.created);

  const liveUids = new Set<string>();
  const rows: Row[] = [];
  const skipped: { subId: string; reason: string }[] = [];

  for (const sub of liveSubs) {
    const priceId = sub.items.data[0]?.price?.id ?? "";
    const hasCard = !!sub.default_payment_method;
    const billable = sub.status === "active" || (sub.status === "trialing" && hasCard);
    if (!billable) {
      skipped.push({ subId: sub.id, reason: "cardless_trial" });
      continue;
    }

    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    let uid = sub.metadata?.uid || null;
    if (!uid) {
      const snap = await db
        .collection("users")
        .where("stripeCustomerId", "==", customerId)
        .limit(1)
        .get();
      uid = snap.empty ? null : snap.docs[0].id;
    }
    if (!uid) {
      skipped.push({ subId: sub.id, reason: "no_uid" });
      continue;
    }
    liveUids.add(uid);

    const plan = getPlanFromPriceId(priceId);
    const family = isFamilyPriceId(priceId);
    const schools = isSchoolsPriceId(priceId);

    const ref = db.collection("users").doc(uid);
    const cur = (await ref.get()).data() ?? {};
    const changed =
      cur.plan !== plan ||
      cur.subscriptionStatus !== sub.status ||
      cur.priceId !== priceId ||
      cur.subscriptionId !== sub.id ||
      (family && cur.familyId !== uid) ||
      (schools && cur.schoolId !== uid);

    if (changed && !dryRun) {
      await ref.set(
        {
          plan,
          subscriptionStatus: sub.status,
          subscriptionId: sub.id,
          priceId,
          stripeCustomerId: customerId,
          trialEnd: sub.trial_end ?? null,
          cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
          ...(family && { familyId: uid }),
          ...(schools && { schoolId: uid }),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    }

    rows.push({
      uid,
      subId: sub.id,
      plan,
      status: sub.status,
      was: { plan: cur.plan as string | undefined, status: cur.subscriptionStatus as string | undefined },
      changed,
    });
  }

  // ---------- PASS B: docs marked live but with no live sub -> downgrade ----------
  const downgraded: { uid: string; was: string }[] = [];
  const skippedComp: string[] = [];
  for (const st of ["active", "trialing"] as const) {
    const snap = await db.collection("users").where("subscriptionStatus", "==", st).get();
    for (const doc of snap.docs) {
      if (liveUids.has(doc.id)) continue;
      // Comp / internal accounts (owner, testing) keep their access even
      // without a live Stripe sub — never downgrade them.
      if (doc.data()?.comp === true) {
        skippedComp.push(doc.id);
        continue;
      }
      downgraded.push({ uid: doc.id, was: st });
      if (!dryRun) {
        await doc.ref.set(
          { plan: "basic", subscriptionStatus: "canceled", updatedAt: new Date().toISOString() },
          { merge: true },
        );
      }
    }
  }

  return NextResponse.json({
    dryRun,
    scannedLiveSubs: liveSubs.length,
    billablePayers: liveUids.size,
    docsFixedUndercount: rows.filter((r) => r.changed).length,
    docsDowngradedOvercount: downgraded.length,
    rowsChanged: rows.filter((r) => r.changed),
    downgraded,
    skippedComp,
    skipped,
    hint: dryRun ? "Re-run without dryRun=1 to apply." : "Counts reconciled. Re-check /api/admin/overview.",
  });
}
