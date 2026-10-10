/**
 * POST /api/auth/email-link  { email, lang, next }  →  { ok: true }
 *
 * "Email me a sign-in link" (Gadi 2026-10-10: a subscriber who forgot his
 * password could not upgrade). Sends a one-time Firebase sign-in link in
 * Gadit's own email, in the visitor's language. Only for an EXISTING
 * account: a new person signs up through the normal form, which carries
 * the age and terms gate. The answer is the same either way, so the form
 * never tells anyone whether an address is registered.
 *
 * The link lands on /auth/finish on the host the visitor asked from (www,
 * or the purchase host gadit.app) and then returns to `next`.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { sendMail } from "@/lib/mail";
import { mailCopy } from "@/lib/login-help-copy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RTL = new Set(["he", "ar", "fa"]);
const HOSTS = new Set(["https://www.gadit.app", "https://gadit.app"]);

function emailHtml(lang: string, link: string): string {
  const c = mailCopy(lang);
  const dir = RTL.has(lang) ? "rtl" : "ltr";
  const align = dir === "rtl" ? "right" : "left";
  return `<!doctype html><html lang="${lang}" dir="${dir}"><body style="margin:0;background:#F2F6F4;font-family:Arial,Helvetica,sans-serif;color:#172320">
<div style="max-width:520px;margin:0 auto;padding:32px 20px;text-align:${align}" dir="${dir}">
<div style="font-size:26px;font-weight:800;direction:ltr;text-align:${align}">Gad<span style="color:#0EA5A5;font-style:italic">it</span></div>
<div style="background:#fff;border-radius:16px;padding:26px 24px;margin-top:18px;box-shadow:0 0 0 1px #DAE3E0">
<p style="margin:0 0 10px;font-size:17px">${c.hi}</p>
<p style="margin:0 0 22px;font-size:17px;line-height:1.6">${c.body}</p>
<p style="margin:0 0 22px;text-align:center"><a href="${link}" style="display:inline-block;background:#0F6F6C;color:#fff;text-decoration:none;font-weight:700;font-size:17px;padding:14px 30px;border-radius:999px">${c.button}</a></p>
<p style="margin:0;font-size:13px;line-height:1.6;color:#5C6B66">${c.foot}</p>
</div></div></body></html>`;
}

export async function POST(req: NextRequest) {
  let email = "", lang = "he", next = "/";
  try {
    const b = (await req.json()) as { email?: unknown; lang?: unknown; next?: unknown };
    if (typeof b.email === "string") email = b.email.trim().toLowerCase().slice(0, 200);
    if (typeof b.lang === "string" && /^[a-zA-Z-]{2,6}$/.test(b.lang)) lang = b.lang;
    if (typeof b.next === "string" && b.next.startsWith("/") && !b.next.startsWith("//")) next = b.next.slice(0, 300);
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "invalid_email" }, { status: 400 });

  const ok = NextResponse.json({ ok: true });
  // One link a minute per address, so the form can't be used to flood a mailbox.
  const db = getAdminDb();
  const throttle = db.collection("emailLinkRequests").doc(crypto.createHash("sha256").update(email).digest("hex").slice(0, 32));
  try {
    const t = await throttle.get();
    const last = (t.data()?.at as number | undefined) ?? 0;
    if (Date.now() - last < 60_000) return ok;
    await throttle.set({ at: Date.now() });
  } catch { /* best-effort */ }

  try {
    await getAdminAuth().getUserByEmail(email);
  } catch {
    return ok; // no such account: say nothing
  }

  const origin = req.headers.get("origin") || "";
  const host = HOSTS.has(origin) ? origin : "https://www.gadit.app";
  const prefix = lang === "en" ? "" : `/${lang}`;
  const finish = `${host}${prefix}/auth/finish?e=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`;
  try {
    const link = await getAdminAuth().generateSignInWithEmailLink(email, { url: finish, handleCodeInApp: true });
    const c = mailCopy(lang);
    await sendMail({ from: "Gadit <notify@gadit.app>", to: email, subject: c.subject, html: emailHtml(lang, link) });
  } catch (e) {
    console.error("[email-link]", e);
  }
  return ok;
}
