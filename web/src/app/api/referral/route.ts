import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { generateReferralCode, inviteUrl } from "@/lib/referral";

/**
 * GET /api/referral — the signed-in user's invite link + stats.
 *
 * Lazily mints a unique referralCode on the user doc the first time they open
 * the invite page, then returns it plus their running counts:
 *   invited     = friends who signed up through the link (referralSignups)
 *   joinedPaid  = of those, how many became paying (referralConversions)
 *   rewardsOwed = free months earned, pending grant (referralRewardsOwed)
 *
 * Reward payout is admin-granted in v1 (no billing-path automation yet).
 */
export const maxDuration = 20;

async function ensureUniqueCode(db: FirebaseFirestore.Firestore): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateReferralCode();
    const clash = await db.collection("users").where("referralCode", "==", code).limit(1).get();
    if (clash.empty) return code;
  }
  // Extremely unlikely; fall back to a longer code to guarantee uniqueness.
  return generateReferralCode() + generateReferralCode();
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) return NextResponse.json({ error: "login_required" }, { status: 401 });
    let decoded;
    try {
      decoded = await getAdminAuth().verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }
    const uid = decoded.uid;

    const db = getAdminDb();
    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();
    const data = snap.data() ?? {};

    let code = data.referralCode as string | undefined;
    if (!code) {
      code = await ensureUniqueCode(db);
      await ref.set({ referralCode: code }, { merge: true });
    }

    return NextResponse.json({
      code,
      link: inviteUrl(code),
      invited: (data.referralSignups as number | undefined) ?? 0,
      joinedPaid: (data.referralConversions as number | undefined) ?? 0,
      rewardsOwed: (data.referralRewardsOwed as number | undefined) ?? 0,
    });
  } catch (e) {
    console.error("[referral] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
