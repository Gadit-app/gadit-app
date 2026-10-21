import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { loadFamilyProgress, publicFamilyProgress } from "@/lib/family-progress";

/**
 * Family progress dashboard data.
 *
 * The parent (family owner) sees, per child, how their vocabulary is
 * growing: total words in their notebook, words added in the last 7
 * days, and the most recent words. This is the feature that turns
 * Gadit from "a nicer dictionary" into a report card a parent pays to
 * keep: ChatGPT is a conversation that vanishes, Gadit accumulates and
 * shows the growth.
 *
 * The numbers come from lib/family-progress (loadFamilyProgress), the same
 * function the weekly parent report email uses, so both always agree.
 *
 * Owner-only: the caller must be the family owner (families/{uid}
 * exists with their uid). A paired child cannot read siblings' data.
 */

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });

    const db = getAdminDb();
    const ownerUid = userInfo.userId;

    // Owner check: the family doc id is the owner's uid.
    const famSnap = await db.collection("families").doc(ownerUid).get();
    if (!famSnap.exists) {
      return NextResponse.json({ error: "not_family_owner" }, { status: 403 });
    }

    return NextResponse.json(publicFamilyProgress(await loadFamilyProgress(ownerUid)));
  } catch (err) {
    console.error("[family/progress] error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
