/**
 * POST /api/kids/buy-skin  — body { themeId }
 *
 * Spend GIFT points to unlock a paid skin (kids gamification v2 store). Prices
 * come from SKIN_PRICES (the server's source of truth — the client price is
 * display only and never trusted). One transaction: verify the skin is for
 * sale, not already owned, and affordable; then decrement giftPoints and add
 * the skin to ownedSkins. Idempotent — buying an owned skin is a no-op success.
 *
 * Only spends the cosmetic gift wallet; never touches earned `points`/ranks.
 *
 *   → { owned: true, giftPoints, ownedSkins } | 402 insufficient_points
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { SKIN_PRICES } from "@/lib/gamification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const userInfo = await verifyUserAndGetPlan(idToken);
  if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });
  if (userInfo.plan !== "clear" && userInfo.plan !== "deep") {
    return NextResponse.json({ error: "upgrade_required" }, { status: 402 });
  }

  let themeId = "";
  try {
    themeId = (((await req.json()) as { themeId?: string }).themeId ?? "").trim();
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  const price = SKIN_PRICES[themeId];
  if (price == null) return NextResponse.json({ error: "not_for_sale" }, { status: 400 });

  const db = getAdminDb();
  const userRef = db.collection("users").doc(userInfo.userId);

  try {
    const out = await db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      const d = snap.data() as { giftPoints?: number; ownedSkins?: string[] } | undefined;
      const owned = Array.isArray(d?.ownedSkins) ? d!.ownedSkins : [];
      const giftPoints = Number(d?.giftPoints) || 0;

      if (owned.includes(themeId)) {
        return { status: "already" as const, giftPoints, ownedSkins: owned };
      }
      if (giftPoints < price) {
        return { status: "insufficient" as const, giftPoints, ownedSkins: owned };
      }
      const nextOwned = [...owned, themeId];
      tx.set(userRef, {
        giftPoints: FieldValue.increment(-price),
        ownedSkins: FieldValue.arrayUnion(themeId),
      }, { merge: true });
      return { status: "bought" as const, giftPoints: giftPoints - price, ownedSkins: nextOwned };
    });

    if (out.status === "insufficient") {
      return NextResponse.json(
        { error: "insufficient_points", giftPoints: out.giftPoints, price },
        { status: 402 },
      );
    }
    return NextResponse.json({ owned: true, giftPoints: out.giftPoints, ownedSkins: out.ownedSkins });
  } catch (err) {
    console.error("[kids/buy-skin] failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
