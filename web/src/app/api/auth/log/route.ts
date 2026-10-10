/**
 * POST /api/auth/log  { email, code, mode, lang, page }
 *
 * Notes a failed sign-in, so a locked-out person shows up in
 * /admin/auth-errors before they have to complain (Gadi 2026-10-10). Never
 * the password. Signed-out callers by nature, so no auth; fields are capped
 * and one address is noted at most once a minute per error.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cut = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");

export async function POST(req: NextRequest) {
  let b: Record<string, unknown> = {};
  try { b = (await req.json()) as Record<string, unknown>; } catch { return NextResponse.json({ ok: true }); }
  const email = cut(b.email, 200).trim().toLowerCase();
  const raw = cut(b.code, 300);
  const code = raw.match(/auth\/[a-z-]+/)?.[0] ?? raw.match(/[A-Z_]{6,}/)?.[0] ?? raw.slice(0, 80) ?? "unknown";
  const mode = cut(b.mode, 20);
  const id = crypto.createHash("sha256").update(`${email}|${code}|${mode}|${Math.floor(Date.now() / 60_000)}`).digest("hex").slice(0, 32);
  try {
    await getAdminDb().collection("authErrors").doc(id).set({
      email: email || null,
      code,
      mode,
      lang: cut(b.lang, 8),
      page: cut(b.page, 200),
      ua: cut(req.headers.get("user-agent"), 160),
      at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[auth/log]", e);
  }
  return NextResponse.json({ ok: true });
}
