import { NextRequest, NextResponse } from "next/server";
import { verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { accountTokenFor } from "@/lib/apple-iap";

export const runtime = "nodejs";

/**
 * GET /api/apple/token: the signed-in account's appAccountToken, which the
 * iOS app attaches to an App Store purchase so the purchase is tied to this
 * account (lib/apple-iap.ts). Kids and impersonated sessions never buy.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const user = await verifyUserAndGetPlan(auth.startsWith("Bearer ") ? auth.slice(7) : null);
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });
  if (user.impersonating) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json({ token: await accountTokenFor(user.userId) });
}
