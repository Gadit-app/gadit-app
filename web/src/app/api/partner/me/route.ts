import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type { Partner } from "@/lib/partners";

/**
 * GET /api/partner/me
 * Headers: Authorization: Bearer <id token>
 *
 * "Am I a partner?" — resolves the LOGGED-IN user to their partner record
 * by email, so the "Partner area" nav can send an existing partner straight
 * to their own dashboard instead of the marketing landing (Gadi 2026-08-18).
 * Partners have no user-linked id (they're keyed by code + emailed
 * dashboardToken), so we match on the verified email from the id token.
 *
 * Returns { isPartner: true, token } (the dashboardToken that opens
 * /partner/dashboard) or { isPartner: false }.
 */
export const maxDuration = 15;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return NextResponse.json({ isPartner: false }, { status: 401 });

  let email = "";
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    email = (decoded.email || "").toLowerCase().trim();
  } catch {
    return NextResponse.json({ isPartner: false }, { status: 401 });
  }
  if (!email) return NextResponse.json({ isPartner: false });

  try {
    const snap = await getAdminDb()
      .collection("partners")
      .where("email", "==", email)
      .limit(1)
      .get();
    if (snap.empty) return NextResponse.json({ isPartner: false });
    const p = snap.docs[0].data() as Partner;
    if (!p.dashboardToken) return NextResponse.json({ isPartner: false });
    return NextResponse.json({ isPartner: true, token: p.dashboardToken });
  } catch {
    // On any lookup error, fall back to "not a partner" so the caller
    // routes to the landing rather than a broken dashboard.
    return NextResponse.json({ isPartner: false });
  }
}
