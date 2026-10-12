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
/** What the parent wants to hear about (Gadi 2026-10-12); all on by default. */
type Cats = { search: boolean; games: boolean; homework: boolean };
export type NotifyPrefs = { enabled: boolean; mode: Mode; cats?: Cats };

const DEFAULT_PREFS: NotifyPrefs = { enabled: false, mode: "instant", cats: { search: true, games: true, homework: true } };

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
  const stored = owner.fam.data()?.notifyPrefs as Partial<NotifyPrefs> | undefined;
  const prefs: NotifyPrefs = stored
    ? { enabled: !!stored.enabled, mode: stored.mode === "daily" ? "daily" : "instant", cats: { search: stored.cats?.search !== false, games: stored.cats?.games !== false, homework: stored.cats?.homework !== false } }
    : DEFAULT_PREFS;
  return NextResponse.json({ prefs });
}

export async function POST(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) return NextResponse.json({ error: "not_family_owner" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as (Partial<NotifyPrefs> & { lang?: string }) | null;
  if (!body) return NextResponse.json({ error: "bad_body" }, { status: 400 });

  const c = (body.cats ?? {}) as Partial<Cats>;
  const prefs: NotifyPrefs = {
    enabled: !!body.enabled,
    mode: body.mode === "daily" ? "daily" : "instant",
    cats: { search: c.search !== false, games: c.games !== false, homework: c.homework !== false },
  };

  // Capture the language the parent is using right now, so every alert
  // (push + email, instant + digest) is rendered in their language.
  const stored: Record<string, unknown> = { ...prefs, updatedAt: new Date().toISOString() };
  if (typeof body.lang === "string" && body.lang.length <= 8) stored.lang = body.lang;

  await getAdminDb()
    .collection("families")
    .doc(owner.uid)
    .set({ notifyPrefs: stored }, { merge: true });

  return NextResponse.json({ ok: true, prefs });
}
