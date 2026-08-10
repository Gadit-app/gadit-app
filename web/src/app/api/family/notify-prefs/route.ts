import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

/**
 * Read / write the family owner's search-notification preferences,
 * stored on the family doc:
 *   families/{ownerUid}.notifyPrefs = { enabled, mode, updatedAt }
 *   mode = "instant" (a banner per word) | "daily" (an end-of-day summary)
 *
 * Owner-only: the family doc id IS the owner's uid.
 */

type Mode = "instant" | "daily";
export type NotifyPrefs = { enabled: boolean; mode: Mode };

const DEFAULT_PREFS: NotifyPrefs = { enabled: false, mode: "instant" };

async function requireOwner(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const userInfo = await verifyUserAndGetPlan(idToken);
  if (!userInfo) return null;
  const db = getAdminDb();
  const fam = await db.collection("families").doc(userInfo.userId).get();
  if (!fam.exists) return null;
  return { uid: userInfo.userId, fam };
}

export async function GET(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) return NextResponse.json({ error: "not_family_owner" }, { status: 403 });
  const prefs = (owner.fam.data()?.notifyPrefs as NotifyPrefs | undefined) ?? DEFAULT_PREFS;
  return NextResponse.json({ prefs });
}

export async function POST(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) return NextResponse.json({ error: "not_family_owner" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as Partial<NotifyPrefs> | null;
  if (!body) return NextResponse.json({ error: "bad_body" }, { status: 400 });

  const prefs: NotifyPrefs = {
    enabled: !!body.enabled,
    mode: body.mode === "daily" ? "daily" : "instant",
  };

  await getAdminDb()
    .collection("families")
    .doc(owner.uid)
    .set({ notifyPrefs: { ...prefs, updatedAt: new Date().toISOString() } }, { merge: true });

  return NextResponse.json({ ok: true, prefs });
}
