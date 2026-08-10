import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

/**
 * Recent word-lookup activity for the family owner's dashboard. Reads the
 * feed we already write on every kid search (families/{ownerUid}/kidSearches)
 * and returns the most recent lookups, newest first, so the parent can see
 * exactly which words each child explored and when.
 *
 * Owner-only: the family doc id IS the owner's uid.
 */

const MAX = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const userInfo = await verifyUserAndGetPlan(idToken);
  if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });

  const db = getAdminDb();
  const ownerUid = userInfo.userId;
  const fam = await db.collection("families").doc(ownerUid).get();
  if (!fam.exists) return NextResponse.json({ error: "not_family_owner" }, { status: 403 });

  const snap = await db
    .collection("families")
    .doc(ownerUid)
    .collection("kidSearches")
    .orderBy("at", "desc")
    .limit(MAX)
    .get();

  const items = snap.docs.map((d) => {
    const x = d.data() as {
      word?: string;
      language?: string;
      kidName?: string;
      memberId?: string | null;
      at?: string;
    };
    return {
      word: x.word ?? "",
      language: x.language ?? "",
      kidName: x.kidName ?? "",
      memberId: x.memberId ?? null,
      at: x.at ?? "",
    };
  });

  return NextResponse.json({ items });
}
