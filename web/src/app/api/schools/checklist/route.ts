import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

/**
 * POST /api/schools/checklist  { step: "activity" | "teachers" }
 *
 * The school dashboard checklist (Gadi 2026-10-10). Most steps are read
 * straight from the school (curriculum, classrooms, words, logo); these two
 * can't be: the projector notes the first class quiz or game, and the
 * principal ticks "teachers have the login" by hand. Stored once, on the
 * school doc, as checklist.<step> = ISO time. School account only.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return NextResponse.json({ error: "login_required" }, { status: 401 });
  let uid: string;
  try {
    uid = (await getAdminAuth().verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }
  let step = "";
  try {
    const b = (await req.json()) as { step?: unknown };
    if (b.step === "activity" || b.step === "teachers") step = b.step;
  } catch { /* fall through */ }
  if (!step) return NextResponse.json({ error: "bad_step" }, { status: 400 });

  const db = getAdminDb();
  const u = (await db.collection("users").doc(uid).get()).data();
  if (u?.schoolId !== uid) return NextResponse.json({ ok: true, skipped: "not_school" });
  const ref = db.collection("schools").doc(uid);
  const cur = ((await ref.get()).data()?.checklist ?? {}) as Record<string, unknown>;
  if (!cur[step]) await ref.set({ checklist: { [step]: new Date().toISOString() } }, { merge: true });
  return NextResponse.json({ ok: true });
}
