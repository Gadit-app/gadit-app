import crypto from "node:crypto";

/**
 * A sign-in link that can live inside an email for a week (Gadi 2026-10-10,
 * login-reminder mail). Firebase's own email-link codes expire within hours,
 * which is too short for a reminder read days later. Token = uid.expiry.sig,
 * HMAC-signed with a key derived from ADMIN_SECRET; /api/auth/remind turns
 * it into a Firebase custom token once (used tokens are recorded).
 */

const DAY = 86_400_000;

function key(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error("ADMIN_SECRET not configured");
  return `${s}|login-link-v1`;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", key()).update(payload).digest("base64url").slice(0, 32);
}

export function makeLoginToken(uid: string, days = 7): string {
  const exp = Date.now() + days * DAY;
  const payload = `${uid}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

/** The uid if the token is genuine and unexpired, else null. */
export function readLoginToken(token: string): { uid: string; sig: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [uid, expS, sig] = parts;
  const exp = Number(expS);
  if (!uid || !Number.isFinite(exp) || exp < Date.now()) return null;
  const want = sign(`${uid}.${expS}`);
  if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  return { uid, sig };
}
