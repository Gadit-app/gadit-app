/**
 * GET /api/kids/wallet
 *
 * The current member's GIFT wallet for the skin store (kids gamification v2):
 * how many gift points they have to spend and which paid skins they already
 * own. Gift points come from a parent reward or Yooniz; they are cosmetic-only
 * and never affect ranks. Light read, own uid only.
 *
 *   → { giftPoints: number, ownedSkins: string[] }
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const userInfo = await verifyUserAndGetPlan(idToken);
  if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });

  const db = getAdminDb();
  const snap = await db.collection("users").doc(userInfo.userId).get();
  const d = snap.data() as { giftPoints?: number; ownedSkins?: string[] } | undefined;
  return NextResponse.json({
    giftPoints: Number(d?.giftPoints) || 0,
    ownedSkins: Array.isArray(d?.ownedSkins) ? d!.ownedSkins : [],
  });
}
