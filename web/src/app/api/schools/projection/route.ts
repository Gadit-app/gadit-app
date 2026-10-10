import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

/**
 * POST /api/schools/projection  { kind, setId, word, subject, title, grade }
 *
 * What the teacher did on the classroom projector (Gadi 2026-10-10): a word
 * shown in present mode ("word"), or a class quiz / game run on it. This is
 * what the principal dashboard is built from in Israeli schools, where there
 * are no student codes. One doc per school, day, kind, set and word, counted
 * (schools/{id}/projections). No personal data: words and units only.
 * The first quiz or game also ticks that step of the dashboard checklist.
 */

const KINDS = new Set(["word", "quiz", "game"]);
const cut = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

function ilDay(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));
}

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
  let b: Record<string, unknown> = {};
  try { b = (await req.json()) as Record<string, unknown>; } catch { /* empty */ }
  const kind = cut(b.kind, 10);
  const word = cut(b.word, 80);
  const setId = cut(b.setId, 120);
  if (!KINDS.has(kind) || !word || !setId) return NextResponse.json({ error: "bad_body" }, { status: 400 });

  const db = getAdminDb();
  const schoolId = (await db.collection("users").doc(uid).get()).get("schoolId");
  if (typeof schoolId !== "string" || !schoolId) return NextResponse.json({ ok: true, skipped: "not_school" });

  const now = Date.now();
  const day = ilDay(now);
  const school = db.collection("schools").doc(schoolId);
  const id = crypto.createHash("sha1").update(`${day}|${kind}|${setId}|${word}`).digest("hex").slice(0, 32);
  await school.collection("projections").doc(id).set(
    {
      kind, word, setId,
      subject: cut(b.subject, 80),
      title: cut(b.title, 120),
      grade: cut(b.grade, 40),
      day,
      lastAt: new Date(now).toISOString(),
      count: FieldValue.increment(1),
    },
    { merge: true },
  );
  if (kind !== "word") {
    const cur = ((await school.get()).data()?.checklist ?? {}) as Record<string, unknown>;
    if (!cur.activity) await school.set({ checklist: { activity: new Date(now).toISOString() } }, { merge: true });
  }
  return NextResponse.json({ ok: true });
}
