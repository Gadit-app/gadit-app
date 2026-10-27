import { NextRequest, NextResponse } from "next/server";
import { verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { claimTransaction } from "@/lib/apple-iap";

export const runtime = "nodejs";

/**
 * POST /api/apple/verify { jws }: a purchase (or restore) the iOS app just
 * made. The signed transaction is verified with Apple's certificate chain and,
 * when it belongs to this account, the plan opens (lib/apple-iap.ts). The app
 * finishes the StoreKit transaction only after an ok here.
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const user = await verifyUserAndGetPlan(auth.startsWith("Bearer ") ? auth.slice(7) : null);
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });
  if (user.impersonating) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { jws?: unknown } | null;
  const jws = typeof body?.jws === "string" ? body.jws.trim() : "";
  if (!jws || jws.length > 20000) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  try {
    const r = await claimTransaction(user.userId, jws);
    return r.ok ? NextResponse.json(r) : NextResponse.json(r, { status: r.error === "other_account" ? 409 : 400 });
  } catch (e) {
    console.error("[apple/verify] failed:", e);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
