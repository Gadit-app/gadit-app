import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

/**
 * POST /api/schools/skin  { accent: "#RRGGBB" | "" }
 *
 * Owner-only (schoolId === uid). Saves the school's accent colour, used to
 * theme the /c/<CODE> classroom surface. An empty/absent accent clears it back
 * to Gadit's default teal.
 */

const HEX = /^#[0-9a-fA-F]{6}$/;

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
  const userSnap = await db.collection("users").doc(userId).get();
  if (userSnap.data()?.schoolId !== userId) {
    return NextResponse.json({ error: "schools_subscription_required" }, { status: 403 });
  }

  let accent = "";
  try {
    accent = String(((await req.json()) as { accent?: string }).accent ?? "").trim();
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (accent && !HEX.test(accent)) {
    return NextResponse.json({ error: "bad_color" }, { status: 400 });
  }

  await db.collection("schools").doc(userId).set(
    { skinAccent: accent ? accent : FieldValue.delete() },
    { merge: true },
  );

  return NextResponse.json({ ok: true, skinAccent: accent || null });
}
