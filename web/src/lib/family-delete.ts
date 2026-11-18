import "server-only";
import type { Firestore } from "firebase-admin/firestore";
import { getAdminAuth } from "@/lib/firebase-admin";
import { syntheticUidFor } from "@/lib/family";

/**
 * Deletes one family member and everything that belongs to them (council
 * round 5, 2026-11-18). Before this, removing a child deleted only the member
 * doc and the top user doc, so the child's notebook, journey and the parent's
 * log of the child's searches stayed behind.
 *
 * Each step is best-effort: a missing piece (a child never paired, no searches)
 * is not an error. The photo is an inline data URL on the member doc, so it
 * goes with the doc. A member paired with a real account of their own is left
 * alone apart from the family records: only synthetic uids are deleted.
 */
export async function deleteFamilyMember(db: Firestore, ownerUid: string, memberId: string): Promise<void> {
  const memberRef = db.collection("families").doc(ownerUid).collection("members").doc(memberId);
  const syntheticUid = syntheticUidFor(ownerUid, memberId);

  try {
    await getAdminAuth().deleteUser(syntheticUid);
  } catch {
    /* never paired: no auth user */
  }
  try {
    // users/{syntheticUid} and everything under it: notebook, journey,
    // journeyCards, learnWords, dictationSets, gifts, ledger, stats, meta.
    await db.recursiveDelete(db.collection("users").doc(syntheticUid));
  } catch (e) {
    console.warn("[family-delete] user data:", e);
  }
  try {
    // The parent's activity feed of this child's searches.
    for (let round = 0; round < 50; round++) {
      const snap = await db.collection("families").doc(ownerUid).collection("kidSearches").where("memberId", "==", memberId).limit(400).get();
      if (snap.empty) break;
      const batch = db.batch();
      snap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (e) {
    console.warn("[family-delete] kidSearches:", e);
  }
  try {
    // A tutor's access to this child.
    const grants = await db.collection("coachGrants").where("familyId", "==", ownerUid).where("memberId", "==", memberId).get();
    if (!grants.empty) {
      const batch = db.batch();
      grants.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (e) {
    console.warn("[family-delete] coachGrants:", e);
  }
  await db.recursiveDelete(memberRef);
}

/**
 * The family owner deletes their account: every other member, the family
 * record (with kidSearches and anything else under it) and the Yooniz link go.
 * The owner's own user doc is deleted by the caller.
 */
export async function deleteOwnedFamily(db: Firestore, ownerUid: string): Promise<void> {
  const famRef = db.collection("families").doc(ownerUid);
  if (!(await famRef.get()).exists) return;
  const members = await famRef.collection("members").get();
  for (const m of members.docs) {
    if (m.data()?.isOwner) continue;
    try {
      await deleteFamilyMember(db, ownerUid, m.id);
    } catch (e) {
      console.warn("[family-delete] member", m.id, e);
    }
  }
  await db.recursiveDelete(famRef);
  try {
    const links = await db.collection("yoonizLinks").where("gaditFamilyId", "==", ownerUid).get();
    if (!links.empty) {
      const batch = db.batch();
      links.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (e) {
    console.warn("[family-delete] yoonizLinks:", e);
  }
}
