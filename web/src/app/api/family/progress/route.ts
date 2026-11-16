import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { loadFamilyProgress, publicFamilyProgress } from "@/lib/family-progress";
import { isParentRole, type MemberRole } from "@/lib/family";

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
 * The family owner (families/{uid} exists with their uid), and since
 * 2026-11-16 the second parent too (Gadi: "both parents can see it"): a
 * parent member of the family whose member doc is linked to this very
 * account. A paired child cannot read siblings' data.
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
    if (famSnap.exists) {
      return NextResponse.json(publicFamilyProgress(await loadFamilyProgress(ownerUid)));
    }

    // The second parent: read on the server, never trusted from the client.
    const me = (await db.collection("users").doc(ownerUid).get()).data() ?? {};
    const familyId = typeof me.familyId === "string" ? me.familyId : "";
    const memberId = typeof me.memberId === "string" ? me.memberId : "";
    if (!familyId || !memberId || me.familyRole !== "parent" || familyId === ownerUid) {
      return NextResponse.json({ error: "not_family_owner" }, { status: 403 });
    }
    const member = (await db.collection("families").doc(familyId).collection("members").doc(memberId).get()).data();
    if (!member || member.userId !== ownerUid || !isParentRole(member.role as MemberRole)) {
      return NextResponse.json({ error: "not_family_owner" }, { status: 403 });
    }
    return NextResponse.json({ ...publicFamilyProgress(await loadFamilyProgress(familyId)), readOnly: true });
  } catch (err) {
    console.error("[family/progress] error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
