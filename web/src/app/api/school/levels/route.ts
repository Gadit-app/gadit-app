import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { SCHOOL_TYPES, cleanLevels } from "@/lib/school-levels";

/**
 * The school levels a school's word sets open to (Gadi 2026-10-04).
 * GET  (Bearer)                 → { schoolId, owner, levels }
 * POST (Bearer, owner) { type } → set once; afterwards only /admin/schools
 *                                  can change it.
 */
export const runtime = "nodejs";

async function who(req: NextRequest) {
  const h = req.headers.get("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return null;
  try {
    const { uid } = await getAdminAuth().verifyIdToken(token);
    const schoolId = ((await getAdminDb().collection("users").doc(uid).get()).data()?.schoolId as string) || "";
    return { uid, schoolId };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const u = await who(req);
  if (!u) return NextResponse.json({ error: "login_required" }, { status: 401 });
  if (!u.schoolId) return NextResponse.json({ error: "not_a_school" }, { status: 403 });
  const levels = cleanLevels((await getAdminDb().collection("schools").doc(u.schoolId).get()).data()?.levels);
  return NextResponse.json({ schoolId: u.schoolId, owner: u.uid === u.schoolId, levels });
}

export async function POST(req: NextRequest) {
  const u = await who(req);
  if (!u) return NextResponse.json({ error: "login_required" }, { status: 401 });
  if (!u.schoolId || u.uid !== u.schoolId) return NextResponse.json({ error: "owner_only" }, { status: 403 });
  const { type } = (await req.json().catch(() => ({}))) as { type?: string };
  const t = SCHOOL_TYPES.find((x) => x.key === type);
  if (!t) return NextResponse.json({ error: "bad_type" }, { status: 400 });
  const ref = getAdminDb().collection("schools").doc(u.schoolId);
  const current = cleanLevels((await ref.get()).data()?.levels);
  if (current.length) return NextResponse.json({ error: "already_set", levels: current }, { status: 409 });
  await ref.set({ levels: t.levels, schoolType: t.key, levelsSetAt: new Date().toISOString() }, { merge: true });
  return NextResponse.json({ levels: t.levels });
}
