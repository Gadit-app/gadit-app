/**
 * One place that records what a child finished and tells the parent, as
 * the parent chose (Gadi 2026-10-12): instantly or in the daily summary,
 * and only for the kinds they ticked: words looked up, games and duels,
 * homework and practice. Used by /api/family/notify-activity and by the
 * duel server when a duel between people ends.
 */
import { getAdminDb } from "@/lib/firebase-admin";
import { notifyOwnerActivity, type ActivityKind } from "@/lib/family-notify";

export type NotifyCat = "search" | "games" | "homework";
export type NotifyPrefsDoc = { enabled?: boolean; mode?: string; lang?: string; cats?: Partial<Record<NotifyCat, boolean>> };

export function catOf(kind: ActivityKind | "search"): NotifyCat {
  if (kind === "search") return "search";
  if (kind === "game" || kind === "duel") return "games";
  return "homework";
}

/** Everything is on until the parent unticks it. */
export function catAllowed(prefs: NotifyPrefsDoc | undefined, cat: NotifyCat): boolean {
  return prefs?.cats?.[cat] !== false;
}

/** The child's family and name, or null for a grown-up / no family. */
export async function kidOf(uid: string): Promise<{ ownerUid: string; memberId: string | null; kidName: string } | null> {
  const db = getAdminDb();
  const u = (await db.collection("users").doc(uid).get()).data() as { familyRole?: string; familyId?: string; memberId?: string } | undefined;
  if (!u || u.familyRole !== "kid" || !u.familyId) return null;
  let kidName = "Your child";
  if (u.memberId) {
    const mn = (await db.collection("families").doc(u.familyId).collection("members").doc(u.memberId).get()).data()?.name;
    if (typeof mn === "string" && mn.trim()) kidName = mn.trim();
  }
  return { ownerUid: u.familyId, memberId: u.memberId ?? null, kidName };
}

export async function recordKidActivity(
  kid: { ownerUid: string; memberId: string | null; kidName: string },
  kind: ActivityKind,
  opts: { label: string; score?: number; total?: number },
): Promise<void> {
  const famRef = getAdminDb().collection("families").doc(kid.ownerUid);
  const prefs = (await famRef.get()).data()?.notifyPrefs as NotifyPrefsDoc | undefined;
  const allowed = !!prefs?.enabled && catAllowed(prefs, catOf(kind));
  const daily = allowed && prefs?.mode === "daily";
  await famRef.collection("kidActivity").add({
    kind, label: opts.label, score: opts.score ?? null, total: opts.total ?? null,
    memberId: kid.memberId, kidName: kid.kidName, at: new Date().toISOString(),
    // Waits for the daily summary only when the parent chose it for this kind.
    notified: !daily,
  });
  if (allowed && !daily) await notifyOwnerActivity(kid.ownerUid, kid.kidName, kind, opts);
}
