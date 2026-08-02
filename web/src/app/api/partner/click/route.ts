/**
 * POST /api/partner/click   body: { ref: "<code>" }
 *
 * The Yooniz-style referral link is gadit.app/?ref=<code>. A small client
 * component (RefCapture) fires this on landing: it records the click and
 * drops the 60-day attribution cookie carrying the partner's id. When the
 * visitor later creates an account, /api/notify-signup reads the cookie
 * and stamps `referredBy` on their user doc.
 *
 * Unknown / suspended codes are a no-op (no cookie) so a typo can't
 * attribute a future sale to nobody. Always returns 200 so the client
 * never surfaces an error to a normal visitor.
 */
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { REFERRAL_COOKIE, REFERRAL_TTL_DAYS, Partner } from "@/lib/partners";

export const maxDuration = 15;

export async function POST(req: NextRequest) {
  const ok = NextResponse.json({ ok: true });
  try {
    const body = await req.json().catch(() => null);
    const code = String(body?.ref ?? "").toUpperCase().trim().slice(0, 12);
    if (!code) return ok;

    const db = getAdminDb();
    const snap = await db.collection("partners").where("code", "==", code).limit(1).get();
    if (snap.empty) return ok;
    const partner = { id: snap.docs[0].id, ...(snap.docs[0].data() as Omit<Partner, "id">) };
    if (partner.status === "suspended") return ok;

    try {
      await snap.docs[0].ref.update({ clicks: FieldValue.increment(1) });
    } catch (e) {
      console.warn("[/api/partner/click] increment failed:", e);
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(REFERRAL_COOKIE, partner.id, {
      maxAge: REFERRAL_TTL_DAYS * 24 * 60 * 60,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });
    return res;
  } catch (err) {
    console.error("[/api/partner/click] error:", err);
    return ok;
  }
}
