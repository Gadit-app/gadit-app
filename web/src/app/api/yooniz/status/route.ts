/**
 * POST /api/yooniz/status  — body: { token }
 *
 * HMAC-signed subscription check so Yooniz can render the right thing next to
 * each family: an active Gadit Family → show the per-member launch list; no
 * active Family → show the Gadit promo card → GADIT_SIGNUP_URL (contract §2.1).
 *
 * Same secret + token encoding as the SSO launch token (§1), MINUS the member
 * fields — the payload is just { v, parentEmail, iat } (extra fields ignored).
 * Token = base64url(JSON payload) + "." + base64url(HMAC_SHA256(bodyString)).
 * The HMAC is computed over the base64url BODY STRING, not the raw JSON.
 * Returns { subscribed: boolean } for the family's parentEmail. Read-only,
 * idempotent, server-to-server: HMAC + 120s freshness are enforced, but no
 * nonce replay cache (Yooniz may poll this repeatedly).
 *
 * DEBUG: pass ?debug=<ADMIN_SECRET> (or header x-admin-secret) to get a
 * diagnostic that names the exact failing stage (signature_mismatch, stale,
 * bad_version, ...) plus the configured secret's LENGTH, so a secret mismatch
 * or clock skew between the two sides can be pinpointed in one call. The debug
 * output NEVER contains the secret itself, only its length and HMAC prefixes.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function b64urlToBuf(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}
function bufToB64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

type StatusPayload = { v: number; parentEmail: string; iat: number };
type VerifyResult =
  | { ok: true; payload: StatusPayload }
  | { ok: false; reason: string; detail?: Record<string, unknown> };

/** Verify the status token: constant-time HMAC + v===1 + 120s freshness.
 *  Returns a structured reason so the debug path can name the failing stage. */
function verify(token: string, secret: string): VerifyResult {
  const t = (token || "").trim();
  const parts = t.split(".");
  if (parts.length !== 2) return { ok: false, reason: "bad_format", detail: { parts: parts.length } };
  const [p, sig] = parts;

  const expected = crypto.createHmac("sha256", secret).update(p).digest();
  const got = b64urlToBuf(sig);
  const sigOk = got.length === expected.length && crypto.timingSafeEqual(got, expected);
  if (!sigOk) {
    return {
      ok: false,
      reason: "signature_mismatch",
      // Prefixes only — an HMAC prefix reveals nothing about the secret. If these
      // differ, the secret is not byte-identical on both sides (or the body that
      // Yooniz SIGNED is not the body string it SENT).
      detail: {
        expectedSigPrefix: bufToB64url(expected).slice(0, 10),
        gotSigPrefix: sig.slice(0, 10),
        hint: "secret differs on the two sides, or signed-body != sent-body",
      },
    };
  }

  let payload: StatusPayload;
  try {
    payload = JSON.parse(b64urlToBuf(p).toString("utf8"));
  } catch {
    return { ok: false, reason: "bad_payload_json" };
  }
  if (payload.v !== 1) return { ok: false, reason: "bad_version", detail: { v: payload.v } };
  if (!payload.parentEmail) return { ok: false, reason: "no_parent_email" };
  const nowSec = Math.floor(Date.now() / 1000);
  const skew = typeof payload.iat === "number" ? nowSec - payload.iat : null;
  if (skew === null || Math.abs(skew) > 120) {
    return {
      ok: false,
      reason: "stale_or_future",
      detail: { iat: payload.iat, nowSec, skewSeconds: skew, windowSeconds: 120 },
    };
  }
  return { ok: true, payload };
}

export async function POST(req: NextRequest) {
  const secret = process.env.YOONIZ_GADIT_SSO_SECRET;

  // Admin-gated diagnostics (Gadi's own ADMIN_SECRET). Off by default.
  const adminSecret = process.env.ADMIN_SECRET;
  const supplied =
    new URL(req.url).searchParams.get("debug") || req.headers.get("x-admin-secret") || "";
  const debugOn = !!adminSecret && supplied === adminSecret;

  if (!secret) {
    return NextResponse.json(
      { error: "not_configured", ...(debugOn ? { debug: { secretPresent: false } } : {}) },
      { status: 503 },
    );
  }

  let token = "";
  try {
    token = (await req.json())?.token || "";
  } catch {
    /* ignore */
  }

  const res: VerifyResult = token ? verify(token, secret) : { ok: false, reason: "no_token" };
  if (!res.ok) {
    if (debugOn) {
      return NextResponse.json(
        {
          error: "invalid_token",
          debug: { reason: res.reason, ...(res.detail ?? {}), secretPresent: true, secretLength: secret.length },
        },
        { status: 401 },
      );
    }
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  const db = getAdminDb();
  const auth = getAdminAuth();
  const email = res.payload.parentEmail.toLowerCase().trim();

  // subscribed === owns an ACTIVE paid Gadit Family (plan "deep" + a families
  // doc). Mirrors the SSO entitlement gate exactly. No side effects.
  let subscribed = false;
  let lookupNote = "ok";
  try {
    const ownerUid = (await auth.getUserByEmail(email)).uid;
    const [userSnap, famSnap] = await Promise.all([
      db.collection("users").doc(ownerUid).get(),
      db.collection("families").doc(ownerUid).get(),
    ]);
    subscribed = famSnap.exists && (userSnap.data() as { plan?: string })?.plan === "deep";
    if (!subscribed) lookupNote = famSnap.exists ? "family_doc_but_plan_not_deep" : "no_family_doc";
  } catch {
    subscribed = false; // no Gadit account for this email
    lookupNote = "no_gadit_account_for_email";
  }

  if (debugOn) {
    return NextResponse.json({
      subscribed,
      debug: { reason: "ok", parentEmail: email, lookupNote, secretLength: secret.length },
    });
  }
  return NextResponse.json({ subscribed });
}
