/**
 * POST /api/auth/lost: the session black box (lib/session-blackbox.ts).
 *
 * One note for a session that ended without the person pressing "התנתקו", or
 * a page that loaded with no session although this browser had one (Gadi
 * 2026-11-23: signed out three times in a day, mid-work). Signed-out callers
 * by nature, so no auth: known fields only, every field capped, at most one
 * note per tab, kind and minute. Never a token, an email or a request body.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cut = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : null);

export async function POST(req: NextRequest) {
  let b: Record<string, unknown> = {};
  try { b = (await req.json()) as Record<string, unknown>; } catch { return NextResponse.json({ ok: true }); }
  const kind = cut(b.kind, 20);
  const uid = cut(b.uid, 128);
  if ((kind !== "lost" && kind !== "lost-at-load") || !/^[A-Za-z0-9_-]{6,128}$/.test(uid)) {
    return NextResponse.json({ ok: true });
  }
  const fails = Array.isArray(b.fails)
    ? (b.fails as unknown[]).slice(0, 8).map((f) => {
        const o = (f ?? {}) as Record<string, unknown>;
        return { api: cut(o.api, 60), status: num(o.status), code: cut(o.code, 80), agoSec: num(o.agoSec) };
      })
    : [];
  const tab = cut(b.tab, 12);
  const id = crypto.createHash("sha256").update(`${uid}|${kind}|${tab}|${Math.floor(Date.now() / 60_000)}`).digest("hex").slice(0, 32);
  try {
    await getAdminDb().collection("authLost").doc(id).set({
      kind,
      uid,
      child: b.child === true,
      tab,
      providers: cut(b.providers, 60),
      reason: cut(b.reason, 40),
      signOutStack: cut(b.signOutStack, 1500),
      signOutAgoMs: num(b.signOutAgoMs),
      fails,
      storedAtStart: cut(b.storedAtStart, 10),
      host: cut(b.host, 40),
      path: cut(b.path, 160),
      inFrame: b.inFrame === true,
      visible: cut(b.visible, 12),
      online: b.online !== false,
      sinceLoadSec: num(b.sinceLoadSec),
      tokenLeftMin: num(b.tokenLeftMin),
      lastSeenMinAgo: num(b.lastSeenMinAgo),
      build: cut(b.build, 12),
      ua: cut(req.headers.get("user-agent"), 160),
      at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[auth/lost]", e);
  }
  return NextResponse.json({ ok: true });
}
