import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { kidTesters, paySlips, weekOf, PAY } from "@/lib/tester-pay";

/**
 * A tester's own pay slip (Gadi 2026-11-02): GET ?week=YYYY-MM-DD (a
 * Sunday; default this week), Bearer token. Testers only.
 */
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  let uid = "";
  try { uid = (await getAdminAuth().verifyIdToken(token)).uid; } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const u = (await getAdminDb().collection("users").doc(uid).get()).data();
  if (u?.tester !== true) return NextResponse.json({ error: "not a tester" }, { status: 403 });
  const q = req.nextUrl.searchParams.get("week") ?? "";
  const week = /^\d{4}-\d{2}-\d{2}$/.test(q) ? weekOf(new Date(`${q}T12:00:00Z`)) : weekOf();
  // the team bonus needs every child tester's week
  const ids = await kidTesters();
  const slips = await paySlips(ids.includes(uid) ? ids : [...ids, uid], week);
  const mine = slips.find((s) => s.uid === uid)!;
  return NextResponse.json({ slip: mine, thisWeek: weekOf(), pay: PAY });
}
