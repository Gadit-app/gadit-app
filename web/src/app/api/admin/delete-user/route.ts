import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

/**
 * One-shot admin tool — delete a Firebase Auth user by email, plus
 * their Firestore /users/{uid} doc and /users/{uid}/notebook subtree.
 *
 * USAGE:
 *   POST /api/admin/delete-user?secret=$ADMIN_SECRET
 *   Body: { "email": "sharon@example.com" }
 *   Optional query: dryRun=1 — report what would be deleted, no writes
 *
 * Auth: ADMIN_SECRET env var (same one used by /api/admin/cleanup-cache).
 * If unset, the endpoint refuses to run so it's safe by default.
 *
 * Response: {
 *   dryRun: bool,
 *   email: string,
 *   uid: string | null,
 *   deletedAuthUser: bool,
 *   deletedUserDoc: bool,
 *   deletedNotebookEntries: number,
 * }
 *
 * Built for the case where someone (e.g. signing up their spouse)
 * created an account by mistake and the user wants it gone so they
 * can re-create with the right password. Deleting via Firebase
 * Console works too — this endpoint just spares the trip.
 */

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_SECRET env var not configured, refusing to run" },
      { status: 503 },
    );
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";

  // Accept EITHER an email OR a uid. Uid is needed for duplicate
  // accounts that have no Auth email (e.g. an extra account created
  // during checkout) — those can't be targeted by email.
  let email = "";
  let uidParam = "";
  try {
    const body = (await req.json()) as { email?: string; uid?: string };
    email = (body.email ?? "").trim().toLowerCase();
    uidParam = (body.uid ?? "").trim();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (!email && !uidParam) {
    return NextResponse.json({ error: "email or uid required in body" }, { status: 400 });
  }
  if (email && !email.includes("@")) {
    return NextResponse.json({ error: "valid email required in body" }, { status: 400 });
  }

  const auth = getAdminAuth();
  const db   = getAdminDb();

  // Resolve the uid: explicit uid wins; otherwise look up by email.
  let uid: string | null = uidParam || null;
  if (!uid && email) {
    try {
      const u = await auth.getUserByEmail(email);
      uid = u.uid;
    } catch (e) {
      // Not in Firebase Auth — still try to clean any leftover Firestore docs.
      console.warn("[admin/delete-user] not found in Auth:", email, String(e));
    }
  }

  // SAFETY GUARD: never delete an account with a live subscription.
  // A paying Family/Schools/Clear/Deep owner must not be wiped by an
  // accidental click on the wrong duplicate row (Reut incident,
  // 2026-07-23). The webhook keeps subscriptionStatus current on the
  // user doc.
  if (uid) {
    const doc = await db.collection("users").doc(uid).get();
    const status = doc.exists ? (doc.data()?.subscriptionStatus as string | undefined) : undefined;
    if (status === "active" || status === "trialing") {
      return NextResponse.json(
        {
          error: "refused: this account has a live subscription (" + status + "). " +
            "Cancel the subscription first if you really mean to delete a paying user.",
          uid,
          subscriptionStatus: status,
        },
        { status: 409 },
      );
    }
  }

  let deletedAuthUser = false;
  let deletedUserDoc = false;
  let deletedNotebookEntries = 0;

  if (uid) {
    // Notebook subcollection — paginate, batch-delete in groups of 400.
    const notebookRef = db.collection("users").doc(uid).collection("notebook");
    let snap = await notebookRef.limit(400).get();
    while (!snap.empty) {
      deletedNotebookEntries += snap.docs.length;
      if (!dryRun) {
        const batch = db.batch();
        for (const d of snap.docs) batch.delete(d.ref);
        await batch.commit();
      } else {
        break; // dry run reports only the first page count
      }
      snap = await notebookRef.limit(400).get();
    }

    // Top-level user doc
    const userDocRef = db.collection("users").doc(uid);
    const userDoc = await userDocRef.get();
    if (userDoc.exists) {
      if (!dryRun) await userDocRef.delete();
      deletedUserDoc = true;
    }

    // Finally, the Auth record itself
    if (!dryRun) await auth.deleteUser(uid);
    deletedAuthUser = true;
  }

  return NextResponse.json({
    dryRun,
    email,
    uid,
    deletedAuthUser,
    deletedUserDoc,
    deletedNotebookEntries,
    hint: dryRun
      ? "Re-run without dryRun=1 to actually delete."
      : "Account fully removed. The user can sign up again with the same email.",
  });
}
