import crypto from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { signToken } from "@/lib/yooniz";

const YOONIZ_LEARNING_URL = process.env.YOONIZ_LEARNING_URL || "https://yooniz.com/api/gadit/learning-yoon";
const LEARNING_YOON_PER_WORD = 10; // credit per understood word; Yooniz caps at 30/week/kid

/**
 * Direction B of the Yooniz <-> Gadit points bridge: when a kid proves they
 * understood a word, credit "learning Yoon" into their linked Yooniz family.
 *
 * Best-effort and safe: only fires for a KID member that is linked to Yooniz
 * (has a yoonizKidId). Every non-200 / cap / not-enabled / family-not-found
 * case is a no-op, never an error (Yooniz enforces its own 30/week cap and
 * opt-in). Yooniz is idempotent by nonce, so a repeat is harmless. Returns
 * void and never throws — it must never block or break the understood flow.
 */
export async function creditYoonizLearning(uid: string): Promise<void> {
  const secret = process.env.YOONIZ_GADIT_SSO_SECRET;
  if (!secret) return;
  try {
    const db = getAdminDb();
    const auth = getAdminAuth();
    const u = (await db.collection("users").doc(uid).get()).data() as
      | { familyId?: string; memberId?: string; familyRole?: string }
      | undefined;
    if (!u || u.familyRole !== "kid" || !u.familyId || !u.memberId) return;
    const member = (await db.collection("families").doc(u.familyId).collection("members").doc(u.memberId).get()).data() as
      | { yoonizKidId?: string }
      | undefined;
    const yoonizKidId = member?.yoonizKidId;
    if (!yoonizKidId) return; // not linked to a Yooniz family
    const parentEmail = ((await auth.getUser(u.familyId)).email || "").toLowerCase().trim();
    if (!parentEmail) return;

    const payload = {
      v: 1, parentEmail, memberId: yoonizKidId, amount: LEARNING_YOON_PER_WORD,
      eventType: "word_understood", iat: Math.floor(Date.now() / 1000), nonce: crypto.randomUUID(),
    };
    const token = signToken(payload, secret);
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 3500);
    try {
      const res = await fetch(YOONIZ_LEARNING_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        signal: ac.signal,
      });
      if (!res.ok) console.warn("[yooniz learning-yoon] http", res.status);
    } finally {
      clearTimeout(timer);
    }
  } catch (e) {
    console.warn("[yooniz learning-yoon] skipped:", (e as Error)?.message);
  }
}
