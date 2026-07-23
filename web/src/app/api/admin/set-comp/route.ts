import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

/**
 * Admin tool — mark a user account as a COMP (complimentary / internal)
 * account, or clear the flag.
 *
 * A comp account keeps its feature plan (e.g. deep for admin/testing) and
 * full access, but is EXCLUDED from the paying-customer counts in
 * /api/admin/overview (activeSubscriptions + MRR) and is never touched by
 * /api/admin/reconcile-subs Pass B. This is for the owner's own account
 * and any internal accounts that would otherwise pollute revenue metrics
 * (Gadi's account, 2026-07-23 — set active/deep manually with no live
 * Stripe sub, so it inflated the count by one).
 *
 * USAGE:
 *   POST /api/admin/set-comp?secret=$ADMIN_SECRET
 *   Body: { "email": "gadibenlavi@gmail.com", "comp": true }
 *      or { "uid": "ePzi...", "comp": false }
 *
 * Auth: ADMIN_SECRET env var.
 */

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let email = "";
  let uidParam = "";
  let comp = true;
  try {
    const body = (await req.json()) as { email?: string; uid?: string; comp?: boolean };
    email = (body.email ?? "").trim().toLowerCase();
    uidParam = (body.uid ?? "").trim();
    if (typeof body.comp === "boolean") comp = body.comp;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (!email && !uidParam) {
    return NextResponse.json({ error: "email or uid required" }, { status: 400 });
  }

  const auth = getAdminAuth();
  const db = getAdminDb();

  let uid: string | null = uidParam || null;
  if (!uid && email) {
    try {
      uid = (await auth.getUserByEmail(email)).uid;
    } catch (e) {
      return NextResponse.json({ error: "user not found in Auth: " + email, detail: String(e) }, { status: 404 });
    }
  }
  if (!uid) {
    return NextResponse.json({ error: "could not resolve uid" }, { status: 404 });
  }

  const ref = db.collection("users").doc(uid);
  const before = (await ref.get()).data() ?? {};
  await ref.set({ comp, updatedAt: new Date().toISOString() }, { merge: true });

  return NextResponse.json({
    uid,
    email: email || (before.email as string | undefined) || null,
    comp,
    plan: before.plan ?? "basic",
    note: comp
      ? "Account is now comp: keeps its plan/access, excluded from paying counts."
      : "Comp flag cleared: account counts normally again.",
  });
}
