/**
 * Small Firestore counters for abuse limits (rateLimits/<bucket>_<key>_<window>).
 * A fixed time window per counter; a Firestore error lets the call through,
 * so a database hiccup never blocks a real user.
 */
import type { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "./firebase-admin";

/** The caller's IP as Vercel reports it ("unknown" locally). */
export function requestIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function counterRef(bucket: string, key: string, windowSec: number) {
  const win = Math.floor(Date.now() / 1000 / windowSec);
  const safe = key.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 300);
  return getAdminDb().collection("rateLimits").doc(`${bucket}_${safe}_${win}`);
}

/** The current count in this window (0 when missing or on error). */
export async function limitCount(bucket: string, key: string, windowSec: number): Promise<number> {
  try {
    const snap = await counterRef(bucket, key, windowSec).get();
    return (snap.data()?.count as number) ?? 0;
  } catch {
    return 0;
  }
}

/** Adds one to the counter and returns the new count (0 on error). */
export async function limitBump(bucket: string, key: string, windowSec: number): Promise<number> {
  try {
    const ref = counterRef(bucket, key, windowSec);
    await ref.set(
      { count: FieldValue.increment(1), bucket, expiresAt: new Date(Date.now() + windowSec * 2000) },
      { merge: true },
    );
    const snap = await ref.get();
    return (snap.data()?.count as number) ?? 1;
  } catch {
    return 0;
  }
}
