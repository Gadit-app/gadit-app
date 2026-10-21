import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { isIosAppUA } from "@/lib/native-app";
import { pendingCheckoutFor } from "@/lib/checkout-recovery";

/**
 * GET /api/checkout/pending: the signed-in person's unfinished checkout
 * (a card-less trial they opened and left), for the "pick up where you left
 * off" banner on /families, /individuals and /pricing (Gadi 2026-10-21).
 * Returns { priceId, plan } or { none: true }. Never anything inside the
 * Play or iOS app, where no purchase may be offered.
 */

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const NONE = () => NextResponse.json({ none: true }, { headers: { "Cache-Control": "no-store" } });

export async function GET(req: NextRequest) {
  if (req.cookies.get("gadit_play")?.value === "1" || isIosAppUA(req.headers.get("user-agent"))) return NONE();
  const authHeader = req.headers.get("authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return NextResponse.json({ error: "login_required" }, { status: 401 });
  let uid: string;
  try {
    uid = (await getAdminAuth().verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }
  try {
    const p = await pendingCheckoutFor(stripe, getAdminDb(), uid);
    if (!p) return NONE();
    return NextResponse.json(p, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.warn("[checkout/pending] lookup failed", e);
    return NONE();
  }
}
