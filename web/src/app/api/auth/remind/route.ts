/**
 * GET /api/auth/remind?t=<login token>&l=<lang>
 *
 * The button in the login-reminder email (Gadi 2026-10-10). A genuine,
 * unexpired, unused token becomes a Firebase custom token, and the visitor
 * is sent to /auth/finish, which signs them in and opens their notebook.
 * Anything else lands on the home page, where they can sign in normally.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { readLoginToken } from "@/lib/login-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const t = req.nextUrl.searchParams.get("t") || "";
  const l = req.nextUrl.searchParams.get("l") || "he";
  const lang = /^[a-zA-Z-]{2,6}$/.test(l) ? l : "he";
  const prefix = lang === "en" ? "" : `/${lang}`;
  const base = "https://www.gadit.app";
  const home = NextResponse.redirect(`${base}${prefix}/`, 302);

  const tok = readLoginToken(t);
  if (!tok) return home;
  const db = getAdminDb();
  const used = db.collection("loginTokensUsed").doc(tok.sig);
  try {
    const ok = await db.runTransaction(async (tx) => {
      const s = await tx.get(used);
      if (s.exists) return false;
      tx.set(used, { uid: tok.uid, at: new Date().toISOString() });
      return true;
    });
    if (!ok) return home;
    const custom = await getAdminAuth().createCustomToken(tok.uid);
    const res = NextResponse.redirect(`${base}${prefix}/auth/finish?ct=${encodeURIComponent(custom)}&next=${encodeURIComponent(`${prefix}/notebook`)}`, 302);
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (e) {
    console.error("[auth/remind]", e);
    return home;
  }
}
