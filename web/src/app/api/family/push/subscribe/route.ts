import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

/**
 * Store / remove a Web Push subscription for the authenticated family
 * owner. Called by the parent's device when they toggle "notify me when
 * my child looks up a word" on. Subscriptions live at
 *   families/{ownerUid}/pushSubs/{endpointHash}
 * so lib/push.ts can fan a push out to every device the parent enabled.
 *
 * Owner-only: the family doc id is the owner's uid, so we simply require
 * the caller to be a real user (kids can't own a family doc, and we key
 * everything by their own uid anyway).
 */

function endpointHash(endpoint: string): string {
  return crypto.createHash("sha256").update(endpoint).digest("hex").slice(0, 24);
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const userInfo = await verifyUserAndGetPlan(idToken);
  if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { subscription?: { endpoint?: string } } | null;
  const sub = body?.subscription;
  if (!sub || typeof sub.endpoint !== "string") {
    return NextResponse.json({ error: "bad_subscription" }, { status: 400 });
  }

  const db = getAdminDb();
  await db
    .collection("families")
    .doc(userInfo.userId)
    .collection("pushSubs")
    .doc(endpointHash(sub.endpoint))
    .set({ subscription: sub, endpoint: sub.endpoint, createdAt: new Date().toISOString() });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const userInfo = await verifyUserAndGetPlan(idToken);
  if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { endpoint?: string } | null;
  const db = getAdminDb();
  const subsRef = db.collection("families").doc(userInfo.userId).collection("pushSubs");

  if (body?.endpoint) {
    await subsRef.doc(endpointHash(body.endpoint)).delete().catch(() => {});
  } else {
    // No endpoint given: clear all of this owner's subscriptions.
    const all = await subsRef.get();
    await Promise.all(all.docs.map((d) => d.ref.delete()));
  }
  return NextResponse.json({ ok: true });
}
