/**
 * Shared HMAC token crypto for the Yooniz <-> Gadit bridge (same scheme as the
 * SSO / status endpoints): token = base64url(JSON payload) + "." +
 * base64url(HMAC_SHA256(bodyString, YOONIZ_GADIT_SSO_SECRET)). The HMAC is over
 * the base64url BODY STRING (before the dot); sig is base64url without "="
 * padding; payload carries v:1 + iat (unix seconds, 120s freshness window).
 * Used by the gift endpoint (verify) and the learning-Yoon caller (sign).
 */
import crypto from "node:crypto";

export function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function b64urlToBuf(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

/** Mint a signed token for a payload (adds nothing — pass a complete payload). */
export function signToken(payload: object, secret: string): string {
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = b64url(crypto.createHmac("sha256", secret).update(body).digest());
  return `${body}.${sig}`;
}

export type VerifyResult =
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; reason: string; detail?: Record<string, unknown> };

/** Verify a token: constant-time HMAC over the base64url body + v===1 + 120s. */
export function verifyToken(token: string, secret: string): VerifyResult {
  const t = (token || "").trim();
  const parts = t.split(".");
  if (parts.length !== 2) return { ok: false, reason: "bad_format" };
  const [body, sig] = parts;
  const expected = crypto.createHmac("sha256", secret).update(body).digest();
  const got = b64urlToBuf(sig);
  if (got.length !== expected.length || !crypto.timingSafeEqual(got, expected)) {
    return { ok: false, reason: "signature_mismatch" };
  }
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(b64urlToBuf(body).toString("utf8"));
  } catch {
    return { ok: false, reason: "bad_payload_json" };
  }
  if (payload.v !== 1) return { ok: false, reason: "bad_version" };
  const nowSec = Math.floor(Date.now() / 1000);
  const iat = payload.iat;
  if (typeof iat !== "number" || Math.abs(nowSec - iat) > 120) {
    return { ok: false, reason: "stale_or_future", detail: { iat, nowSec } };
  }
  return { ok: true, payload };
}

/**
 * Week key = the Sunday (YYYY-MM-DD) of the current Sunday-Saturday week in
 * ISRAEL local time (handles DST via Intl). Used to enforce the weekly gift
 * cap consistently regardless of server timezone.
 */
export function israelWeekKey(now: Date = new Date()): string {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now); // "2026-08-22"
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jerusalem", weekday: "short" }).format(now);
  const dayIdx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
  const d = new Date(`${ymd}T12:00:00Z`); // noon UTC on the Israel calendar date
  d.setUTCDate(d.getUTCDate() - (dayIdx < 0 ? 0 : dayIdx)); // roll back to Sunday
  return d.toISOString().slice(0, 10);
}
