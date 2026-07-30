/**
 * GET /p/<code> — a partner's personal referral link.
 *
 * Records the click, drops a 60-day attribution cookie carrying the
 * partner's id, then redirects to the homepage. When the visitor later
 * creates an account, /api/notify-signup reads the cookie and stamps
 * `referredBy` on their user doc; from then on every Stripe payment they
 * make accrues a commission to this partner.
 *
 * The `/p/` prefix is deliberate: Affonso owns `/r/*` (see next.config),
 * and the two affiliate systems run in parallel for now.
 *
 * Unknown / inactive codes still redirect (never a dead end for a shared
 * link) but set no cookie, so a typo can't attribute a sale to nobody.
 */
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { REFERRAL_COOKIE, REFERRAL_TTL_DAYS, Partner } from "@/lib/partners";

export const maxDuration = 15;

export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code: raw } = await ctx.params;
  const code = (raw || "").toUpperCase().trim();
  const home = new URL("/", req.nextUrl.origin);

  try {
    const db = getAdminDb();
    const snap = await db
      .collection("partners")
      .where("code", "==", code)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.redirect(home, { status: 302 });
    }
    const partner = { id: snap.docs[0].id, ...(snap.docs[0].data() as Omit<Partner, "id">) };
    if (partner.status === "suspended") {
      return NextResponse.redirect(home, { status: 302 });
    }

    // Count the click. Best-effort — a failed increment must never stop
    // the redirect or the attribution cookie.
    try {
      await snap.docs[0].ref.update({ clicks: FieldValue.increment(1) });
    } catch (e) {
      console.warn("[/p] click increment failed:", e);
    }

    const res = NextResponse.redirect(home, { status: 302 });
    res.cookies.set(REFERRAL_COOKIE, partner.id, {
      maxAge: REFERRAL_TTL_DAYS * 24 * 60 * 60,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });
    return res;
  } catch (err) {
    console.error("[/p/<code>] error:", err);
    return NextResponse.redirect(home, { status: 302 });
  }
}
