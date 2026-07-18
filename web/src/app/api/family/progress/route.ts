import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

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
 * Data model: each family member (families/{ownerUid}/members/{id})
 * carries a `userId` once their device is paired; that member's saved
 * words live at users/{userId}/notebook/{wordId} with an ISO `addedAt`.
 * We aggregate server-side with the Admin SDK so one call returns every
 * child's stats regardless of client security rules.
 *
 * Owner-only: the caller must be the family owner (families/{uid}
 * exists with their uid). A paired child cannot read siblings' data.
 */

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type ChildProgress = {
  memberId: string;
  name: string;
  role: string;
  colorIndex: number;
  linked: boolean;
  total: number;
  thisWeek: number;
  recent: string[];
};

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
    if (!famSnap.exists) {
      return NextResponse.json({ error: "not_family_owner" }, { status: 403 });
    }

    const membersSnap = await db
      .collection("families")
      .doc(ownerUid)
      .collection("members")
      .orderBy("createdAt", "asc")
      .get();

    const cutoffIso = new Date(Date.now() - WEEK_MS).toISOString();

    type MemberDoc = {
      id: string;
      role?: string;
      name?: string;
      colorIndex?: number;
      userId?: string | null;
    };
    const children = await Promise.all(
      membersSnap.docs
        .map((d): MemberDoc => ({ id: d.id, ...(d.data() as Omit<MemberDoc, "id">) }))
        // Children only (parents don't need a progress card of their own here).
        .filter((m) => m.role !== "father" && m.role !== "mother")
        .map(async (m): Promise<ChildProgress> => {
          const base: ChildProgress = {
            memberId: m.id,
            name: m.name || "",
            role: m.role || "kid",
            colorIndex: typeof m.colorIndex === "number" ? m.colorIndex : 0,
            linked: false,
            total: 0,
            thisWeek: 0,
            recent: [],
          };
          const uid = m.userId;
          if (!uid) return base;

          const notebook = db.collection("users").doc(uid).collection("notebook");
          try {
            const [totalAgg, weekAgg, recentSnap] = await Promise.all([
              notebook.count().get(),
              notebook.where("addedAt", ">=", cutoffIso).count().get(),
              notebook.orderBy("addedAt", "desc").limit(6).get(),
            ]);
            return {
              ...base,
              linked: true,
              total: totalAgg.data().count,
              thisWeek: weekAgg.data().count,
              recent: recentSnap.docs
                .map((doc) => (doc.data().word as string) || "")
                .filter(Boolean),
            };
          } catch (e) {
            console.error(`[family/progress] notebook read failed for ${uid}:`, e);
            return { ...base, linked: true };
          }
        }),
    );

    const totalWords = children.reduce((sum, c) => sum + c.total, 0);
    const weekWords = children.reduce((sum, c) => sum + c.thisWeek, 0);

    return NextResponse.json({ children, totalWords, weekWords });
  } catch (err) {
    console.error("[family/progress] error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
