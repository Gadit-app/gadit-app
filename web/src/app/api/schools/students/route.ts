import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

/**
 * /api/schools/students
 *
 * POST   { classroomId, name } — append a student name to the
 *                                 classroom's roster.
 * DELETE { classroomId, name } — remove a student name.
 *
 * Owner-only. The teacher pre-loads the roster of student first names
 * (+ optional last-name initial) so the kid view at /c/<CODE> can
 * show a "pick your name" picker on first visit. We use a flat
 * string[] on the classroom doc rather than a subcollection because
 * a classroom has 30-50 students at most, so the entire roster fits
 * comfortably in the doc + reads in one round trip.
 *
 * Names are first-name-only by design. No PII account, no email, no
 * password — Gadi (2026-06-28) decided the roster carries the same
 * privacy weight as a Kahoot leaderboard (a Hebrew first name is not
 * actionable PII by itself).
 */

async function requireOwner(idToken: string | null): Promise<string | null> {
  if (!idToken) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const db = getAdminDb();
    const userSnap = await db.collection("users").doc(decoded.uid).get();
    const userData = userSnap.data();
    if (userData?.schoolId !== decoded.uid) return null;
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const ownerUid = await requireOwner(idToken);
  if (!ownerUid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { classroomId?: string; name?: string } = {};
  try {
    body = (await req.json()) as { classroomId?: string; name?: string };
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  const classroomId = (body.classroomId ?? "").trim();
  const name = (body.name ?? "").trim().slice(0, 40);
  if (!classroomId || !name) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const db = getAdminDb();
  const classroomRef = db
    .collection("schools")
    .doc(ownerUid)
    .collection("classrooms")
    .doc(classroomId);
  const snap = await classroomRef.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const data = snap.data() as { students?: string[] };
  const current = data.students ?? [];
  if (current.includes(name)) {
    // Idempotent: the same name twice is fine, just no-op.
    return NextResponse.json({ ok: true });
  }
  await classroomRef.update({
    students: FieldValue.arrayUnion(name),
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const ownerUid = await requireOwner(idToken);
  if (!ownerUid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const classroomId = (url.searchParams.get("classroomId") ?? "").trim();
  const name = (url.searchParams.get("name") ?? "").trim();
  if (!classroomId || !name) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const db = getAdminDb();
  const classroomRef = db
    .collection("schools")
    .doc(ownerUid)
    .collection("classrooms")
    .doc(classroomId);
  await classroomRef.update({
    students: FieldValue.arrayRemove(name),
  });
  return NextResponse.json({ ok: true });
}
