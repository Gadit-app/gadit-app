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
