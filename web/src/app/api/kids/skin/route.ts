import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { kidOf } from "@/lib/kid-activity";
import { getRankState } from "@/lib/rank-points";
import { KID_AVATARS } from "@/lib/family";
import { isLookUnlocked, lookById } from "@/lib/looks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST { skinId } → a CHILD puts on an avatar skin (Gadi 2026-10-30).
 *
 * The browser cannot write member docs (only the family owner can), so the
 * kid's own choice goes through here. Allowed: one of the 12 free kid
 * avatars, or a skin from lib/looks.ts that the child's completed practices
 * have unlocked (checked on the server, so it cannot be faked).
 *
 * A skin replaces a parent-uploaded photo on screen. The photo is kept in
 * `avatarPhotoBackup`, so nothing is lost and the parent can bring it back.
 *
 *   → { ok: true, avatarId } | { error }
 */
export async function POST(req: NextRequest) {
  const h = req.headers.get("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return NextResponse.json({ error: "login_required" }, { status: 401 });
  let uid = "";
  try {
    uid = (await getAdminAuth().verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { skinId?: unknown } | null;
  const skinId = typeof body?.skinId === "string" ? body.skinId : "";
  const free = KID_AVATARS.some((a) => a.id === skinId);
  const look = lookById(skinId);
  if (!free && !look) return NextResponse.json({ error: "unknown_skin" }, { status: 400 });

  try {
    const kid = await kidOf(uid);
    if (!kid || !kid.memberId) return NextResponse.json({ error: "not_kid" }, { status: 403 });

    if (look) {
      const { practices } = await getRankState(uid);
      if (!isLookUnlocked(look, practices)) {
        return NextResponse.json({ error: "locked", need: look.unlockAt, have: practices }, { status: 403 });
      }
    }

    const ref = getAdminDb().collection("families").doc(kid.ownerUid).collection("members").doc(kid.memberId);
    await getAdminDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error("member_missing");
      const photo = snap.get("avatarPhotoUrl");
      const patch: Record<string, unknown> = { avatarId: skinId, skinChosenAt: new Date().toISOString() };
      if (typeof photo === "string" && photo) {
        patch.avatarPhotoBackup = photo;
        patch.avatarPhotoUrl = null;
      }
      tx.update(ref, patch);
    });
    return NextResponse.json({ ok: true, avatarId: skinId });
  } catch (e) {
    console.error("[kids/skin] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
