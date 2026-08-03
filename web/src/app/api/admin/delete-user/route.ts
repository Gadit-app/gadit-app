import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { logDeletion } from "@/lib/deletion-log";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * One-shot admin tool — delete a Firebase Auth user by email, plus
 * their Firestore /users/{uid} doc and /users/{uid}/notebook subtree.
 *
 * USAGE:
 *   POST /api/admin/delete-user?secret=$ADMIN_SECRET
 *   Body: { "email": "sharon@example.com" }
 *   Optional query: dryRun=1 — report what would be deleted, no writes
 *
 * Auth: ADMIN_SECRET env var (same one used by /api/admin/cleanup-cache).
 * If unset, the endpoint refuses to run so it's safe by default.
 *
 * Response: {
 *   dryRun: bool,
 *   email: string,
 *   uid: string | null,
 *   deletedAuthUser: bool,
 *   deletedUserDoc: bool,
 *   deletedNotebookEntries: number,
 * }
 *
 * Built for the case where someone (e.g. signing up their spouse)
 * created an account by mistake and the user wants it gone so they
 * can re-create with the right password. Deleting via Firebase
 * Console works too — this endpoint just spares the trip.
 */

export const maxDuration = 60;

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

  // Accept EITHER an email OR a uid. Uid is needed for duplicate
  // accounts that have no Auth email (e.g. an extra account created
  // during checkout) — those can't be targeted by email.
  let email = "";
  let uidParam = "";
  try {
    const body = (await req.json()) as { email?: string; uid?: string };
    email = (body.email ?? "").trim().toLowerCase();
    uidParam = (body.uid ?? "").trim();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (!email && !uidParam) {
    return NextResponse.json({ error: "email or uid required in body" }, { status: 400 });
  }
  if (email && !email.includes("@")) {
    return NextResponse.json({ error: "valid email required in body" }, { status: 400 });
  }

  const auth = getAdminAuth();
  const db   = getAdminDb();

  // Resolve the uid: explicit uid wins; otherwise look up by email.
  let uid: string | null = uidParam || null;
  if (!uid && email) {
    try {
      const u = await auth.getUserByEmail(email);
      uid = u.uid;
    } catch (e) {
      // Not in Firebase Auth — still try to clean any leftover Firestore docs.
      console.warn("[admin/delete-user] not found in Auth:", email, String(e));
    }
  }

  // SAFETY GUARD: never delete a REAL paying account (Reut incident,
  // 2026-07-23). Checked authoritatively against STRIPE, not the doc's
  // subscriptionStatus field (not reliably written). BUT a card-less
  // trialing sub is an ABANDONED checkout — Stripe creates the sub as
  // `trialing` BEFORE the card is entered, and the webhook only grants
  // access once a card is attached. Blocking on it made every
  // abandoned-checkout / test account un-deletable (Gadi's test account
  // osherbenlavi, 2026-08-03). So we block only on `active` subs and
  // `trialing` subs WITH a card — mirroring the webhook's activation rule.
  // Card-less trialing subs are collected and canceled during deletion so
  // no orphaned sub lingers in Stripe.
  const cardlessTrialSubs: string[] = [];
  let auditPlan: string | null = null;
  let auditStatus: string | null = null;
  let auditFamily = false;
  let auditSchool = false;
  if (uid) {
    const doc = await db.collection("users").doc(uid).get();
    const d = doc.exists ? (doc.data() ?? {}) : {};
    auditPlan = (d.plan as string | undefined) ?? null;
    auditStatus = (d.subscriptionStatus as string | undefined) ?? null;
    auditFamily = !!d.familyId;
    auditSchool = !!d.schoolId;
    if (!email && typeof d.email === "string") email = d.email;

    let customerId = (d.stripeCustomerId as string | undefined) ?? null;
    // Fall back to finding the customer by email if the doc lacks the id.
    if (!customerId && email) {
      try {
        const found = await stripe.customers.list({ email, limit: 1 });
        customerId = found.data[0]?.id ?? null;
      } catch { /* ignore */ }
    }
    let blockingStatus: string | null = null;
    if (customerId) {
      try {
        const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 20 });
        for (const s of subs.data) {
          const hasCard = !!s.default_payment_method;
          if (s.status === "active" || (s.status === "trialing" && hasCard)) {
            blockingStatus = s.status; // real paying / trialing-with-card customer
          } else if (s.status === "trialing" && !hasCard) {
            cardlessTrialSubs.push(s.id); // abandoned checkout — safe to cancel
          }
        }
      } catch (e) {
        console.warn("[admin/delete-user] Stripe check failed:", String(e));
      }
    }

    if (blockingStatus) {
      return NextResponse.json(
        {
          error: "refused: this account has a live subscription (" + blockingStatus + "). " +
            "Cancel the subscription in Stripe first if you really mean to delete a paying user.",
          uid,
          subscriptionStatus: blockingStatus,
        },
        { status: 409 },
      );
    }
  }

  let deletedAuthUser = false;
  let deletedUserDoc = false;
  let deletedNotebookEntries = 0;

  if (uid) {
    // Notebook subcollection — paginate, batch-delete in groups of 400.
    const notebookRef = db.collection("users").doc(uid).collection("notebook");
    let snap = await notebookRef.limit(400).get();
    while (!snap.empty) {
      deletedNotebookEntries += snap.docs.length;
      if (!dryRun) {
        const batch = db.batch();
        for (const d of snap.docs) batch.delete(d.ref);
        await batch.commit();
      } else {
        break; // dry run reports only the first page count
      }
      snap = await notebookRef.limit(400).get();
    }

    // Top-level user doc
    const userDocRef = db.collection("users").doc(uid);
    const userDoc = await userDocRef.get();
    if (userDoc.exists) {
      if (!dryRun) await userDocRef.delete();
      deletedUserDoc = true;
    }

    // Cancel any abandoned card-less trialing subs so no orphaned sub
    // lingers in Stripe pointing at a now-deleted user.
    if (!dryRun) {
      for (const subId of cardlessTrialSubs) {
        try {
          await stripe.subscriptions.cancel(subId);
        } catch (e) {
          console.warn("[admin/delete-user] cancel card-less sub failed:", subId, String(e));
        }
      }
    }

    // Finally, the Auth record itself
    if (!dryRun) await auth.deleteUser(uid);
    deletedAuthUser = true;

    // Audit: record the admin deletion (non-blocking, real runs only).
    if (!dryRun) {
      await logDeletion({
        uid,
        email: email || null,
        source: "admin",
        plan: auditPlan,
        subscriptionStatus: auditStatus,
        isFamily: auditFamily,
        isSchool: auditSchool,
        canceledSubs: cardlessTrialSubs.length,
      });
    }
  }

  return NextResponse.json({
    dryRun,
    email,
    uid,
    deletedAuthUser,
    deletedUserDoc,
    deletedNotebookEntries,
    canceledCardlessSubs: cardlessTrialSubs.length,
    hint: dryRun
      ? "Re-run without dryRun=1 to actually delete."
      : "Account fully removed. The user can sign up again with the same email.",
  });
}
