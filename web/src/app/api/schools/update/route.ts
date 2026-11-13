import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

/**
 * POST /api/schools/update
 *
 * The three edits a school owner used to write straight from the browser:
 * the name of the school, the daily summary preference, and the name,
 * teacher, colour and student list of a classroom. Only these fields are
 * written, each one checked, so the school doc can be closed to browser
 * writes (2026-11-13).
 *
 *   { name }                                             school name
 *   { dailyDigest: { enabled, hour } }                   daily summary
 *   { classroom: { id, name, teacherName, colorIndex, students } }
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return NextResponse.json({ error: "login_required" }, { status: 401 });
  let userId: string;
  try {
    userId = (await getAdminAuth().verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  const db = getAdminDb();
  if ((await db.collection("users").doc(userId).get()).data()?.schoolId !== userId) {
    return NextResponse.json({ error: "schools_subscription_required" }, { status: 403 });
  }
  const schoolRef = db.collection("schools").doc(userId);
  if (!(await schoolRef.get()).exists) return NextResponse.json({ error: "school_not_ready" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }

  if (typeof body.name === "string") {
    const name = body.name.trim().slice(0, 120);
    if (!name) return NextResponse.json({ error: "bad_name" }, { status: 400 });
    await schoolRef.update({ name, updatedAt: new Date().toISOString() });
    return NextResponse.json({ ok: true });
  }

  if (body.dailyDigest && typeof body.dailyDigest === "object") {
    const d = body.dailyDigest as { enabled?: unknown; hour?: unknown };
    const hour = Math.floor(Number(d.hour));
    await schoolRef.update({
      dailyDigest: { enabled: d.enabled !== false, hour: Number.isFinite(hour) && hour >= 0 && hour <= 23 ? hour : 15 },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.classroom && typeof body.classroom === "object") {
    const c = body.classroom as { id?: unknown; name?: unknown; teacherName?: unknown; colorIndex?: unknown; students?: unknown };
    const id = typeof c.id === "string" && c.id && !c.id.includes("/") ? c.id : "";
    if (!id) return NextResponse.json({ error: "classroom_not_found" }, { status: 404 });
    const ref = schoolRef.collection("classrooms").doc(id);
    if (!(await ref.get()).exists) return NextResponse.json({ error: "classroom_not_found" }, { status: 404 });
    // Same clean-up as the page: trimmed, no empties, no repeats, 60 at most.
    const seen = new Set<string>();
    const students: string[] = [];
    for (const raw of Array.isArray(c.students) ? c.students : []) {
      const s = typeof raw === "string" ? raw.trim() : "";
      if (!s || s.length > 40 || seen.has(s.toLowerCase())) continue;
      seen.add(s.toLowerCase());
      students.push(s);
      if (students.length >= 60) break;
    }
    const ci = Math.floor(Number(c.colorIndex));
    await ref.update({
      name: String(c.name ?? "").trim().slice(0, 60),
      teacherName: String(c.teacherName ?? "").trim().slice(0, 60) || null,
      colorIndex: Number.isFinite(ci) && ci >= 0 && ci <= 5 ? ci : 0,
      students,
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
}
