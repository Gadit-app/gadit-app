import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { syntheticUidFor } from "@/lib/family";

/**
 * ADMIN, read-only: dump a family's members + the exact state the profile
 * switcher depends on, so we can see why switching to a given kid fails.
 * For each member it reports whether the synthetic Firebase Auth user
 * exists, whether the users/{syntheticUid} doc exists, its plan/role, the
 * notebook word count, and whether createCustomToken would succeed.
 *
 *   GET /api/admin/family-inspect?secret=$ADMIN_SECRET&email=<parent email>
 *   (or &familyId=<uid>)
 */
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  if (!process.env.ADMIN_SECRET) return NextResponse.json({ error: "no ADMIN_SECRET" }, { status: 503 });
  if (secret !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const auth = getAdminAuth();
  const db = getAdminDb();

  let familyId = (req.nextUrl.searchParams.get("familyId") || "").trim();
  const email = (req.nextUrl.searchParams.get("email") || "").trim();
  if (!familyId && email) {
    try {
      const u = await auth.getUserByEmail(email);
      familyId = u.uid;
    } catch {
      return NextResponse.json({ error: "no auth user for email", email }, { status: 404 });
    }
  }
  if (!familyId) return NextResponse.json({ error: "email or familyId required" }, { status: 400 });

  // parent user doc — resolveFamily reads users/{parentUid}.familyId
  const parentDoc = await db.collection("users").doc(familyId).get();
  const parentFamilyId = parentDoc.exists ? (parentDoc.data()?.familyId ?? null) : null;

  const memSnap = await db.collection("families").doc(familyId).collection("members").orderBy("createdAt", "asc").get().catch(async () => {
    return db.collection("families").doc(familyId).collection("members").get();
  });

  const members = [];
  for (const d of memSnap.docs) {
    const m = d.data() as Record<string, unknown>;
    const memberId = d.id;
    const syntheticUid = syntheticUidFor(familyId, memberId);
    let authUserExists = false;
    try { await auth.getUser(syntheticUid); authUserExists = true; } catch { authUserExists = false; }
    const uDoc = await db.collection("users").doc(syntheticUid).get();
    let words = 0;
    try {
      const nb = await db.collection("users").doc(syntheticUid).collection("notebook").count().get();
      words = nb.data().count;
    } catch { words = -1; }
    // would createCustomToken work? (only for a real signing service account)
    let canMintToken = null as null | boolean;
    let mintErr = "";
    try { await auth.createCustomToken(syntheticUid, { probe: true }); canMintToken = true; }
    catch (e) { canMintToken = false; mintErr = String(e instanceof Error ? e.message : e).slice(0, 160); }
    members.push({
      memberId, name: m.name ?? "", role: m.role ?? null, isOwner: !!m.isOwner,
      userIdField: m.userId ?? null, syntheticUid,
      authUserExists, userDocExists: uDoc.exists, userDocPlan: uDoc.data()?.plan ?? null,
      words, canMintToken, mintErr,
    });
  }

  return NextResponse.json({
    familyId,
    parentUserDocExists: parentDoc.exists,
    parentFamilyIdField: parentFamilyId,
    parentFamilyIdMatches: parentFamilyId === familyId,
    memberCount: members.length,
    members,
  });
}
