/**
 * GET /invite/<code> — a member's personal invite link (member-gets-member).
 *
 * Drops a 60-day attribution cookie carrying the referrer's code, then
 * redirects home. When the visitor later creates an account,
 * /api/notify-signup reads the cookie and stamps `referredByUser` on their
 * user doc; when they later pay, the webhook credits the referrer.
 *
 * Distinct from /p/<code> (the PARTNER affiliate link). Unknown codes still
 * redirect (never a dead end) — attribution just resolves to nobody at signup.
 */
import { NextRequest, NextResponse } from "next/server";
import { REFERRAL_USER_COOKIE, REFERRAL_USER_TTL_DAYS } from "@/lib/referral";

export const maxDuration = 15;

export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code: raw } = await ctx.params;
  const code = (raw || "").toUpperCase().trim().slice(0, 12);
  // Land on home with a soft welcome flag the page can use to say "a friend
  // invited you". The cookie is what actually carries attribution.
  const home = new URL(code ? "/?invited=1" : "/", req.nextUrl.origin);

  const res = NextResponse.redirect(home, { status: 302 });
  if (/^[A-Z0-9]{4,12}$/.test(code)) {
    res.cookies.set(REFERRAL_USER_COOKIE, code, {
      maxAge: REFERRAL_USER_TTL_DAYS * 24 * 60 * 60,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });
  }
  return res;
}
