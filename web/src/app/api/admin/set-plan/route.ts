/**
 * POST /api/admin/set-plan?secret=$ADMIN_SECRET
 * body: { uid?, email?, plan }   (one of uid/email required)
 *
 * Admin helper to set a user's feature plan in Firestore (users/{uid}.plan).
 * Used to comp a Google Play review account to "deep" so the reviewer sees the
 * paid features, and for occasional support grants. Auth: ADMIN_SECRET (same as
 * the other admin endpoints). GET with the same query returns the current plan.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["basic", "clear", "deep"]);

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
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if (req.nextUrl.searchParams.get("secret") !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const uid = await resolveUid(
    req.nextUrl.searchParams.get("uid") || undefined,
    req.nextUrl.searchParams.get("email") || undefined,
  );
  if (!uid) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  const snap = await getAdminDb().collection("users").doc(uid).get();
  return NextResponse.json({ uid, exists: snap.exists, plan: (snap.data() as { plan?: string })?.plan ?? null });
}

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if (req.nextUrl.searchParams.get("secret") !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { uid?: string; email?: string; plan?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* ignore */
  }
  const plan = body.plan;
  if (!plan || !ALLOWED.has(plan)) return NextResponse.json({ error: "bad_plan", allowed: [...ALLOWED] }, { status: 400 });

  const uid = await resolveUid(body.uid, body.email);
  if (!uid) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  await getAdminDb().collection("users").doc(uid).set(
    { plan, planSetBy: "admin", planSetAt: new Date().toISOString() },
    { merge: true },
  );
  return NextResponse.json({ ok: true, uid, plan });
}
