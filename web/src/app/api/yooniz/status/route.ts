/**
 * POST /api/yooniz/status  — body: { token }
 *
 * HMAC-signed subscription check so Yooniz can render the right thing next to
 * each family: an active Gadit Family → show the per-member launch list; no
 * active Family → show the Gadit promo card → GADIT_SIGNUP_URL (contract §2.1).
 *
 * Same secret + token encoding as the SSO launch token (§1), MINUS the member
 * fields — the payload is just { v, yoonizFamilyId, parentEmail, iat, nonce }.
 * Returns { subscribed: boolean } for the family's parentEmail. Read-only,
 * idempotent, server-to-server: HMAC + 120s freshness are enforced, but no
 * nonce replay cache (Yooniz may poll this repeatedly).
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function b64urlToBuf(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

type StatusPayload = { v: number; parentEmail: string; iat: number };

/** Verify the status token: constant-time HMAC + v===1 + 120s freshness. */
function verify(token: string, secret: string): StatusPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [p, sig] = parts;
  const expected = crypto.createHmac("sha256", secret).update(p).digest();
  const got = b64urlToBuf(sig);
  if (got.length !== expected.length || !crypto.timingSafeEqual(got, expected)) return null;
  let payload: StatusPayload;
  try {
    payload = JSON.parse(b64urlToBuf(p).toString("utf8"));
  } catch {
    return null;
  }
  if (payload.v !== 1 || !payload.parentEmail) return null;
  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof payload.iat !== "number" || Math.abs(nowSec - payload.iat) > 120) return null;
  return payload;
}

export async function POST(req: NextRequest) {
  const secret = process.env.YOONIZ_GADIT_SSO_SECRET;
  if (!secret) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  let token = "";
  try {
    token = (await req.json())?.token || "";
  } catch {
    /* ignore */
  }
  const payload = token ? verify(token, secret) : null;
  if (!payload) return NextResponse.json({ error: "invalid_token" }, { status: 401 });

  const db = getAdminDb();
  const auth = getAdminAuth();
  const email = payload.parentEmail.toLowerCase().trim();

  // subscribed === owns an ACTIVE paid Gadit Family (plan "deep" + a families
  // doc). Mirrors the SSO entitlement gate exactly. No side effects.
  let subscribed = false;
  try {
    const ownerUid = (await auth.getUserByEmail(email)).uid;
    const [userSnap, famSnap] = await Promise.all([
      db.collection("users").doc(ownerUid).get(),
      db.collection("families").doc(ownerUid).get(),
    ]);
    subscribed = famSnap.exists && (userSnap.data() as { plan?: string })?.plan === "deep";
  } catch {
    subscribed = false; // no Gadit account for this email
  }

  return NextResponse.json({ subscribed });
}
