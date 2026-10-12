import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { readPracticeDays } from "@/lib/practice-days";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → { days: string[] } the signed-in user's practice days (see lib/practice-days). */
export async function GET(req: NextRequest) {
  const h = req.headers.get("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return NextResponse.json({ days: [] });
  try {
    const uid = (await getAdminAuth().verifyIdToken(token)).uid;
    return NextResponse.json({ days: await readPracticeDays(uid) });
  } catch {
    return NextResponse.json({ days: [] });
  }
}
