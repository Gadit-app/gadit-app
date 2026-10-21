import { getAdminDb } from "@/lib/firebase-admin";

/**
 * A Family's children and second parent ride on the owner's subscription
 * (Gadi 2026-10-21: when an owner's subscription ended, the owner went back to
 * Basic but the kids kept "deep", so three cancelled families still had the
 * paid features). Every plan change of an owner is copied to the members.
 * Skipped: a member paying for their own plan, and accounts we comped.
 */
export async function syncFamilyMembersPlan(ownerUid: string, plan: "basic" | "clear" | "deep") {
  try {
    const db = getAdminDb();
    const owner = (await db.collection("users").doc(ownerUid).get()).data();
    if (owner?.familyId !== ownerUid) return; // not a Family owner
    const members = await db.collection("users").where("familyId", "==", ownerUid).get();
    const batch = db.batch();
    let n = 0;
    for (const m of members.docs) {
      if (m.id === ownerUid) continue;
      const d = m.data();
      const ownLive = d.subscriptionStatus === "active" || d.subscriptionStatus === "trialing" || d.subscriptionStatus === "past_due";
      if (ownLive || d.planSetBy === "admin" || d.plan === plan) continue;
      batch.set(m.ref, { plan, planFromFamily: true, updatedAt: new Date().toISOString() }, { merge: true });
      n++;
    }
    if (n) await batch.commit();
    if (n) console.log(`[family-plan] family ${ownerUid}: ${n} member(s) -> plan=${plan}`);
  } catch (e) {
    console.warn("[family-plan] syncFamilyMembersPlan failed (non-blocking):", e);
  }
}

/**
 * Daily guard (Gadi 2026-10-21: a cancelled family still had the paid
 * features through the kids' accounts). Every account on a paid plan must be
 * explained by one of: its own live subscription, a Family owner or school
 * with one, an account we comped, or one of our own. Family members whose
 * owner is not paying are moved back to Basic (they only ever rode on the
 * owner); anything else unexplained is reported, never changed on its own.
 */
export async function auditPaidAccess(apply: boolean): Promise<{ fixedMembers: string[]; unexplained: Array<{ uid: string; email: string; plan: string; status: string }> }> {
  const db = getAdminDb();
  const us = await db.collection("users").select("email", "plan", "subscriptionStatus", "familyId", "planSetBy", "comp", "schoolId").get();
  const byId = new Map(us.docs.map((d) => [d.id, d.data()]));
  const live = (s: unknown) => s === "active" || s === "trialing" || s === "past_due";
  const internal = (e: unknown) => typeof e === "string" && /@gadit\.app$/i.test(e);
  const covered = (x: FirebaseFirestore.DocumentData | undefined) => !!x && (live(x.subscriptionStatus) || x.planSetBy === "admin" || x.comp === true || internal(x.email));
  const fixedMembers: string[] = [];
  const unexplained: Array<{ uid: string; email: string; plan: string; status: string }> = [];
  for (const [uid, x] of byId) {
    if (x.plan !== "deep" && x.plan !== "clear") continue;
    if (covered(x)) continue;
    if (x.schoolId && covered(byId.get(x.schoolId))) continue;
    if (x.familyId && x.familyId !== uid) {
      if (covered(byId.get(x.familyId))) continue;
      fixedMembers.push(uid);
      if (apply) await db.collection("users").doc(uid).set({ plan: "basic", planFromFamily: true, updatedAt: new Date().toISOString() }, { merge: true });
      continue;
    }
    unexplained.push({ uid, email: String(x.email ?? ""), plan: String(x.plan), status: String(x.subscriptionStatus ?? "-") });
  }
  return { fixedMembers, unexplained };
}
