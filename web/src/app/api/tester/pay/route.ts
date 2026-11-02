import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { kidTesters, monthOf, paySlips, PAY } from "@/lib/tester-pay";

/**
 * A tester's monthly pay (Gadi 2026-11-02): GET ?month=YYYY-MM (default
 * this month), Bearer token. Testers only.
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
  const q = req.nextUrl.searchParams.get("month") ?? "";
  const month = /^\d{4}-\d{2}$/.test(q) ? q : monthOf();
  // the team bonus needs every child tester's week
  const ids = await kidTesters();
  const slips = await paySlips(ids.includes(uid) ? ids : [...ids, uid], month);
  const mine = slips.find((s) => s.uid === uid)!;
  return NextResponse.json({ slip: mine, thisMonth: monthOf(), pay: PAY });
}
