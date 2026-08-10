import { NextRequest, NextResponse } from "next/server";

/**
 * VAPID / Web Push configuration health check. Admin-only. Reports
 * whether each env var is present (booleans only, never the secret
 * values) and whether the public key matches between the server var and
 * the NEXT_PUBLIC (client) var — a common copy-paste mistake that leaves
 * push silently broken. Use after setting the env vars + redeploying.
 *
 *   GET /api/family/push/status?secret=$ADMIN_SECRET
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not set" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const pub = process.env.VAPID_PUBLIC_KEY ?? "";
  const pubClient = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  const priv = process.env.VAPID_PRIVATE_KEY ?? "";
  const subject = process.env.VAPID_SUBJECT ?? "";

  const ready = !!pub && !!pubClient && !!priv && pub === pubClient;

  return NextResponse.json({
    ready,
    VAPID_PUBLIC_KEY: !!pub,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: !!pubClient,
    VAPID_PRIVATE_KEY: !!priv,
    VAPID_SUBJECT: subject || null,
    publicKeysMatch: !!pub && pub === pubClient,
    // helpful non-secret hints
    publicKeyLen: pub.length,
    privateKeyLen: priv.length,
  });
}
