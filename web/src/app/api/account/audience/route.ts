import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

/**
 * POST /api/account/audience { audience: "me" | "child" | "class" }
 * The answer to "Who is Gadit for?" after sign-up (Gadi 2026-10-06), kept on
 * the user doc so the emails and offers can follow it.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const userInfo = await verifyUserAndGetPlan(idToken);
  if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { audience?: string } | null;
  const audience = body?.audience;
  if (audience !== "me" && audience !== "child" && audience !== "class") {
    return NextResponse.json({ error: "bad_audience" }, { status: 400 });
  }
  await getAdminDb().collection("users").doc(userInfo.userId).set(
    { audience, audienceAt: new Date().toISOString() },
    { merge: true },
  );
  return NextResponse.json({ ok: true });
}
