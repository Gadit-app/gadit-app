import { NextRequest, NextResponse } from "next/server";
import { handleNotification } from "@/lib/apple-iap";

export const runtime = "nodejs";

/**
 * POST /api/apple/notifications: App Store Server Notifications V2 (set in
 * App Store Connect for Production and Sandbox). Renewals, billing problems,
 * cancels, expiry and refunds update the account (lib/apple-iap.ts). Only a
 * payload signed by Apple is acted on; anything else gets 400 and Apple
 * retries real ones.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { signedPayload?: unknown } | null;
  const signed = typeof body?.signedPayload === "string" ? body.signedPayload : "";
  if (!signed) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  try {
    const result = await handleNotification(signed);
    console.log("[apple/notifications]", result);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[apple/notifications] rejected:", e);
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}
