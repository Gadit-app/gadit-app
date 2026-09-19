/**
 * POST /api/admin/gift-family?secret=$ADMIN_SECRET
 * body: { email? , uid? , months? }   (one of email/uid required; months default 3)
 *
 * Admin — comp a user to a full FAMILY plan with NO credit card, for a fixed
 * number of months. Sets plan=deep + familyId + bootstraps the family doc and
 * the owner's member row (mirrors the webhook's bootstrapFamily), and records a
 * compUntil timestamp so it can be auto-expired / manually downgraded later.
 *
 * Why not Stripe: the webhook only provisions Family from a subscription that is
 * ACTIVE (a card-less trial is intentionally skipped), so a true no-card comp
 * has to be provisioned directly. Gadi 2026-09-19 (gift for his sister-in-law).
 *
 * GET with the same query returns the current plan/familyId/compUntil.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

function gate(req: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if (req.nextUrl.searchParams.get("secret") !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

async function resolveUid(uid?: string, email?: string): Promise<string | null> {
  if (uid) return uid;
  if (!email) return null;
  try {
    return (await getAdminAuth().getUserByEmail(email.toLowerCase().trim())).uid;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const denied = gate(req); if (denied) return denied;
  const uid = await resolveUid(
    req.nextUrl.searchParams.get("uid") ?? undefined,
    req.nextUrl.searchParams.get("email") ?? undefined,
  );
  if (!uid) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  const snap = await getAdminDb().collection("users").doc(uid).get();
  const d = (snap.data() as Record<string, unknown>) ?? {};
  return NextResponse.json({
    uid, exists: snap.exists,
    plan: d.plan ?? null, familyId: d.familyId ?? null,
    subscriptionStatus: d.subscriptionStatus ?? null,
    compUntil: d.compUntil ?? null,
  });
}

export async function POST(req: NextRequest) {
  const denied = gate(req); if (denied) return denied;

  let email = "", uidParam = "", months = 3;
  try {
    const b = (await req.json()) as { email?: string; uid?: string; months?: number };
    email = (b.email ?? "").trim().toLowerCase();
    uidParam = (b.uid ?? "").trim();
    if (typeof b.months === "number" && b.months > 0 && b.months <= 24) months = Math.floor(b.months);
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const uid = await resolveUid(uidParam || undefined, email || undefined);
  if (!uid) return NextResponse.json({ error: "no Firebase user for that email/uid (have them sign up first)" }, { status: 404 });

  const db = getAdminDb();
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();
  if (!email) email = (userSnap.data()?.email as string | undefined) ?? "";

  // compUntil = now + N months (calendar-month add).
  const until = new Date();
  until.setMonth(until.getMonth() + months);
  const compUntil = until.getTime();

  // 1) The user becomes a Family OWNER: deep plan + familyId = own uid.
  await userRef.set(
    {
      plan: "deep",
      familyId: uid,
      subscriptionStatus: "comp",
      comp: true,
      compUntil,
      compMonths: months,
      planSetBy: "admin",
      planSetAt: new Date().toISOString(),
      ...(email ? { email } : {}),
    },
    { merge: true },
  );

  // 2) Bootstrap the family doc + the owner's member row (mirrors the webhook).
  const familyRef = db.collection("families").doc(uid);
  const familySnap = await familyRef.get();
  if (!familySnap.exists) {
    await familyRef.set({ ownerUid: uid, plan: "monthly", createdAt: new Date().toISOString(), comp: true });
    await familyRef.collection("members").doc(uid).set({
      id: uid, role: "mother", name: "", colorIndex: 0, isOwner: true, userId: uid,
      createdAt: new Date().toISOString(),
    });
  } else {
    await familyRef.set({ comp: true, updatedAt: new Date().toISOString() }, { merge: true });
  }

  return NextResponse.json({
    ok: true, uid, email, plan: "deep", familyId: uid, months,
    compUntil, compUntilISO: until.toISOString(),
    note: "Family comp active (no card). They can add members at /family and pair devices. Downgrade after compUntil (manual or via a comp-expiry check).",
  });
}
