/**
 * POST /api/family/gift-points  — body { memberId, amount }
 *
 * In-app parent reward (kids gamification v2, "approach B"): the paying parent
 * grants GIFT points to one of their children, so the gift store works for
 * EVERY family, not only Yooniz families. Yooniz is just another writer of the
 * same wallet.
 *
 * Gift points are COSMETIC ONLY and weekly-capped — they live in the SEPARATE
 * wallet (users/{syntheticUid}.giftPoints) and NEVER touch earned `points`,
 * ranks, or the parent dashboard. The cap (GIFT_WEEKLY_CAP, Sun-Sat Israel
 * time) is SHARED with the Yooniz gift: both write to the same giftLedger, so a
 * child can receive at most GIFT_WEEKLY_CAP per week from ALL gift sources
 * combined. Owner-only for now (the paying parent).
 *
 *   → { granted, giftPointsTotal, remainingThisWeek }
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { resolveOwner, bearer } from "@/lib/coach";
import { syntheticUidFor } from "@/lib/family";
import { GIFT_WEEKLY_CAP } from "@/lib/gamification";
import { israelWeekKey } from "@/lib/yooniz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

export async function POST(req: NextRequest) {
  const ctx = await resolveOwner(bearer(req));
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let memberId = "", amount = 0;
  try {
    const b = (await req.json()) as { memberId?: string; amount?: number };
    memberId = (b.memberId ?? "").trim();
    amount = Number(b.amount);
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (!memberId) return NextResponse.json({ error: "member_required" }, { status: 400 });
  if (!Number.isInteger(amount) || amount <= 0 || amount > GIFT_WEEKLY_CAP) {
    return NextResponse.json({ error: "bad_amount" }, { status: 400 });
  }

  const db = getAdminDb();
  // The recipient must be a real, non-owner CHILD member of this family.
  const memberSnap = await db.collection("families").doc(ctx.familyId).collection("members").doc(memberId).get();
  if (!memberSnap.exists) return NextResponse.json({ error: "member_not_found" }, { status: 404 });
  const member = memberSnap.data() as { role?: string; isOwner?: boolean };
  if (member.isOwner) return NextResponse.json({ error: "cannot_gift_owner" }, { status: 400 });
  if (member.role !== "boy" && member.role !== "girl") {
    return NextResponse.json({ error: "not_a_child" }, { status: 400 });
  }

  const syntheticUid = syntheticUidFor(ctx.familyId, memberId);
  const weekKey = israelWeekKey();
  const userRef = db.collection("users").doc(syntheticUid);
  const ledgerCol = userRef.collection("giftLedger");
  const nowIso = new Date().toISOString();

  try {
    const out = await db.runTransaction(async (tx) => {
      // Shared weekly cap: sum ALL gift sources (parent + Yooniz) this week.
      const weekSnap = await tx.get(ledgerCol.where("weekKey", "==", weekKey));
      let usedThisWeek = 0;
      weekSnap.forEach((d) => { usedThisWeek += Number((d.data() as { delta?: number }).delta) || 0; });
      const remainingBefore = Math.max(0, GIFT_WEEKLY_CAP - usedThisWeek);
      const granted = Math.max(0, Math.min(amount, remainingBefore));
      const remainingThisWeek = remainingBefore - granted;

      const userSnap = await tx.get(userRef);
      const curGift = Number((userSnap.data() as { giftPoints?: number } | undefined)?.giftPoints) || 0;
      const giftPointsTotal = curGift + granted;

      if (granted > 0) {
        tx.set(userRef, { giftPoints: FieldValue.increment(granted) }, { merge: true });
        tx.set(ledgerCol.doc(), { delta: granted, weekKey, source: "parent_gift", grantedBy: ctx.familyId, ts: nowIso });
      }
      return { granted, giftPointsTotal, remainingThisWeek };
    });
    return NextResponse.json(out);
  } catch (err) {
    console.error("[family/gift-points] failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
