/**
 * POST /api/admin/yooniz-cleanup?secret=$ADMIN_SECRET&mode=both&apply=1
 *
 * One-time reconciliation for the Yooniz integration's old auto-provision rule
 * (removed 2026-08-19). Auth: ADMIN_SECRET (same as the other admin endpoints).
 * DRY-RUN by default — pass apply=1 to actually write. mode = reconcile |
 * dedupe | both (default both).
 *
 * reconcile: families auto-provisioned as FREE Family under the old rule
 *   (marker families.yoonizProvisioned==true / users.yoonizTrial==true —
 *   Shimrit, תהילה מאיר, ADI, צליל חסיד…) are downgraded to plan "basic" and
 *   the family flagged deactivated, so they stop counting as paid subscribers.
 *
 * dedupe: within each Yooniz-linked family, non-owner members that duplicate
 *   another by normalized name + kid/parent class (the דין/אושר bug) are
 *   collapsed — keep the profile with the most notebook words (tie → oldest),
 *   DELETE only duplicates whose notebook is EMPTY, and flag any non-empty
 *   duplicate for manual review instead of deleting data.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { isParentRole, syntheticUidFor, type MemberRole } from "@/lib/family";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function normalizeName(s?: unknown): string {
  return typeof s === "string" ? s.trim().replace(/\s+/g, " ").toLowerCase() : "";
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const mode = req.nextUrl.searchParams.get("mode") || "both";
  const apply = req.nextUrl.searchParams.get("apply") === "1";
  const familyId = req.nextUrl.searchParams.get("familyId") || null;
  const db = getAdminDb();
  const iso = new Date().toISOString();
  const result: Record<string, unknown> = { apply, mode };

  // ── reconcile: downgrade the free auto-provisioned families ───────────────
  if (mode === "reconcile" || mode === "both") {
    const owners = new Set<string>();
    const [provFams, trialUsers] = await Promise.all([
      db.collection("families").where("yoonizProvisioned", "==", true).get(),
      db.collection("users").where("yoonizTrial", "==", true).get(),
    ]);
    provFams.docs.forEach((d) => owners.add(d.id));
    trialUsers.docs.forEach((d) => owners.add(d.id));

    const downgraded: string[] = [];
    for (const ownerUid of owners) {
      // Already reconciled on a prior run → don't re-report it.
      const fam = await db.collection("families").doc(ownerUid).get();
      if ((fam.data() as { deactivated?: boolean })?.deactivated === true) continue;
      downgraded.push(ownerUid);
      if (!apply) continue;
      // Owner user → basic; family → deactivated + marker cleared so this run
      // is idempotent (the next dry-run reports 0).
      await db.collection("users").doc(ownerUid).set(
        { plan: "basic", yoonizTrial: false, yoonizReconciledAt: iso }, { merge: true },
      );
      await db.collection("families").doc(ownerUid).set(
        { deactivated: true, deactivatedReason: "yooniz-auto-provision-reconcile", deactivatedAt: iso, yoonizProvisioned: false }, { merge: true },
      );
      // Synthetic members of that family → basic too (they inherited "deep").
      const members = await db.collection("users").where("familyId", "==", ownerUid).get();
      for (const u of members.docs) {
        if (u.id === ownerUid) continue;
        await u.ref.set({ plan: "basic", yoonizReconciledAt: iso }, { merge: true });
      }
    }
    result.reconcile = { count: downgraded.length, owners: downgraded };
  }

  // ── dedupe: collapse duplicate member profiles per linked family ──────────
  if (mode === "dedupe" || mode === "both") {
    let familyIds: string[];
    if (familyId) {
      familyIds = [familyId];
    } else {
      const links = await db.collection("yoonizLinks").get();
      familyIds = [...new Set(links.docs.map((d) => (d.data() as { gaditFamilyId?: string }).gaditFamilyId).filter(Boolean) as string[])];
    }

    const families: unknown[] = [];
    for (const fid of familyIds) {
      const membersRef = db.collection("families").doc(fid).collection("members");
      const snap = await membersRef.get();
      const members = snap.docs.map((d) => ({ id: d.id, ref: d.ref, m: d.data() as Record<string, unknown> }));

      // Group non-owner members by kid/parent class + normalized name.
      const groups = new Map<string, typeof members>();
      for (const x of members) {
        if (x.m.isOwner) continue;
        const nm = normalizeName(x.m.name);
        if (!nm) continue;
        const key = `${isParentRole(x.m.role as MemberRole) ? "P" : "K"}|${nm}`;
        const arr = groups.get(key) ?? [];
        arr.push(x);
        groups.set(key, arr);
      }

      for (const [key, grp] of groups) {
        if (grp.length < 2) continue;
        // Count notebook words per member (notebooks are small — plain read).
        const withCounts = await Promise.all(
          grp.map(async (x) => {
            const uid = (x.m.userId as string) || syntheticUidFor(fid, x.id);
            const words = (await db.collection("users").doc(uid).collection("notebook").get()).size;
            return { ...x, uid, words };
          }),
        );
        // Keep most words; tie → oldest createdAt.
        withCounts.sort((a, b) => b.words - a.words || String(a.m.createdAt ?? "").localeCompare(String(b.m.createdAt ?? "")));
        const keep = withCounts[0];
        const drop = withCounts.slice(1);
        const remove: unknown[] = [];
        const review: unknown[] = [];
        for (const d of drop) {
          if (d.words === 0) {
            remove.push({ id: d.id, uid: d.uid });
            if (apply) {
              // Preserve the yooniz link on the kept profile if the deleted one carried it.
              const droppedLink = d.m.yoonizKidId || d.m.yoonizMemberId;
              if (droppedLink && !keep.m.yoonizKidId) {
                await keep.ref.set({ yoonizKidId: droppedLink }, { merge: true });
                keep.m.yoonizKidId = droppedLink;
              }
              await d.ref.delete();
              await db.collection("users").doc(d.uid).delete().catch(() => {});
            }
          } else {
            review.push({ id: d.id, uid: d.uid, words: d.words });
          }
        }
        families.push({ familyId: fid, group: key, keep: { id: keep.id, uid: keep.uid, words: keep.words }, remove, review });
      }
    }
    result.dedupe = { familiesScanned: familyIds.length, groups: families };
  }

  return NextResponse.json(result);
}
