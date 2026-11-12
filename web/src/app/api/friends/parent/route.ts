import { ownMemberUid } from "@/lib/family";
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { friendshipOf, friendshipsOf, isParentOf, pairId, profileOf, uidOf } from "@/lib/world/friends-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A parent's view of their children's friends in Word Worlds (Gadi 2026-11-01).
 *
 *   GET → { kids: [{ uid, name, avatar, friends: [{ uid, name, avatar, status, needsMe }] }] }
 *   POST { action: "approve" | "decline" | "remove", kid, friend } → { ok }
 *
 * The caller must be a parent in the child's family. Decline and remove
 * delete the friendship for both children.
 */

async function kidsOf(caller: string): Promise<string[]> {
  const db = getAdminDb();
  const me = (await db.collection("users").doc(caller).get()).data() ?? {};
  const familyId = (me.familyId as string | undefined) ?? ((await db.collection("families").doc(caller).get()).exists ? caller : undefined);
  if (!familyId || (caller !== familyId && me.familyRole !== "parent")) return [];
  const snap = await db.collection("families").doc(familyId).collection("members").get();
  return snap.docs
    .map((d) => d.data() as { role?: string; userId?: string | null })
    .filter((m) => m.role === "boy" || m.role === "girl")
    .map((m) => ownMemberUid(familyId, m.userId))
    .filter((u): u is string => !!u);
}

export async function GET(req: NextRequest) {
  const uid = await uidOf(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const kids = await kidsOf(uid);
  const out = await Promise.all(kids.map(async (k) => {
    const [p, fs] = await Promise.all([profileOf(k), friendshipsOf(k)]);
    const friends = await Promise.all(fs.map(async (f) => {
      const other = f.users[0] === k ? f.users[1] : f.users[0];
      const op = await profileOf(other);
      return { uid: other, name: op.name, avatar: op.avatar, status: f.status, needsMe: !f.ok[k] };
    }));
    return { uid: k, name: p.name, avatar: p.avatar, friends };
  }));
  return NextResponse.json({ kids: out.filter((k) => k.friends.length) });
}

export async function POST(req: NextRequest) {
  const uid = await uidOf(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const b = (await req.json().catch(() => null)) as { action?: string; kid?: string; friend?: string } | null;
  const kid = typeof b?.kid === "string" ? b.kid : "", friend = typeof b?.friend === "string" ? b.friend : "";
  if (!kid || !friend) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (!(await isParentOf(uid, await profileOf(kid)))) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const f = await friendshipOf(kid, friend);
  if (!f) return NextResponse.json({ ok: true });
  const ref = getAdminDb().collection("friendships").doc(pairId(kid, friend));
  if (b?.action === "approve") {
    const ok = { ...f.ok, [kid]: true };
    await ref.set({ ok, status: ok[f.users[0]] && ok[f.users[1]] ? "active" : "pending" }, { merge: true });
    return NextResponse.json({ ok: true });
  }
  if (b?.action === "decline" || b?.action === "remove") {
    await ref.delete();
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
