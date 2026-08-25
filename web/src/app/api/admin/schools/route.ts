import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { computeSchoolInsights } from "@/lib/school-insights";

/**
 * Admin-only cross-school view.
 *
 * GET /api/admin/schools               → list every school (name, contact,
 *                                          plan, classroom count, total lookups)
 * GET /api/admin/schools?schoolId=UID  → the FULL insights for one school,
 *                                          exactly what that principal sees
 *                                          (overview + classrooms + students +
 *                                          the words each student looked up).
 *
 * Lets Gadi walk into any school's dashboard (e.g. Sharon's at Greenburgh) and
 * see the whole building's activity, and roll all schools up at a glance.
 * Auth: valid Firebase ID token whose email is in ADMIN_EMAILS. Else 401/403.
 */

export const maxDuration = 30;

const ADMIN_EMAILS = new Set(["gadibenlavi@gmail.com"]);

async function requireAdmin(req: NextRequest): Promise<
  | { ok: true; email: string }
  | { ok: false; response: NextResponse }
> {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) {
    return { ok: false, response: NextResponse.json({ error: "login_required" }, { status: 401 }) };
  }
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const email = decoded.email ?? "";
    if (!ADMIN_EMAILS.has(email)) {
      return { ok: false, response: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
    }
    return { ok: true, email };
  } catch {
    return { ok: false, response: NextResponse.json({ error: "invalid_token" }, { status: 401 }) };
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const db = getAdminDb();
  const schoolId = req.nextUrl.searchParams.get("schoolId");

  // --- One school: the principal's-eye view -------------------------------
  if (schoolId) {
    const schoolSnap = await db.collection("schools").doc(schoolId).get();
    if (!schoolSnap.exists) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const meta = schoolSnap.data() as {
      name?: string;
      contactEmail?: string | null;
      plan?: string;
      createdAt?: string;
      logoUrl?: string | null;
    };
    const ownerSnap = await db.collection("users").doc(schoolId).get();
    const ownerSearches = (ownerSnap.data()?.searchCount as number) ?? 0;

    // The owner's own recent lookups (last ~10 words), from their paid search
    // history at users/{id}/meta/history. This is the only place the actual
    // WORDS the account looked up are kept (the counter above is just a total),
    // so it answers "what did this school search?" for the owner's own use.
    const histSnap = await db.collection("users").doc(schoolId).collection("meta").doc("history").get();
    const ownerRecentWords = (((histSnap.data()?.items as { word?: string; uiLang?: string; timestamp?: string }[]) ?? [])
      .map((h) => ({ word: (h.word ?? "").trim(), lang: h.uiLang ?? "", at: h.timestamp ?? "" }))
      .filter((h) => h.word));

    const insights = await computeSchoolInsights(db, schoolId);

    // Diagnostic: the TRUE number of logged search docs per classroom, via a
    // cheap Firestore count() aggregation. computeSchoolInsights reports
    // `totalAllTime` from the classroom's `searchCount` counter and `sampleSize`
    // from a capped 200-doc read; this exact count exposes a mismatch (e.g. a
    // classroom whose kids never went through /c/<CODE>, so nothing was logged).
    const loggedCounts = await Promise.all(
      insights.classrooms.map(async (c) => {
        const agg = await db
          .collection("schools").doc(schoolId)
          .collection("classrooms").doc(c.id)
          .collection("searches").count().get();
        return [c.id, agg.data().count] as const;
      }),
    );
    const loggedById = new Map(loggedCounts);
    const classrooms = insights.classrooms.map((c) => ({ ...c, loggedCount: loggedById.get(c.id) ?? 0 }));
    const loggedTotal = loggedCounts.reduce((s, [, n]) => s + n, 0);

    return NextResponse.json({
      school: {
        id: schoolId,
        name: (meta.name ?? "").trim(),
        contactEmail: meta.contactEmail ?? null,
        plan: meta.plan ?? "",
        createdAt: meta.createdAt ?? null,
        logoUrl: meta.logoUrl ?? null,
        ownerSearches,
        ownerRecentWords,
      },
      ...insights,
      classrooms,
      loggedTotal,
    });
  }

  // --- All schools: the administrator roll-up -----------------------------
  const schoolsSnap = await db.collection("schools").get();
  const schools = await Promise.all(
    schoolsSnap.docs.map(async (doc) => {
      const d = doc.data() as {
        name?: string;
        contactEmail?: string | null;
        plan?: string;
        createdAt?: string;
      };
      // Cheap roll-up: read classroom docs only (not their searches) so the
      // list stays fast no matter how much a school has searched.
      const classroomsSnap = await doc.ref.collection("classrooms").get();
      let totalSearches = 0;
      for (const c of classroomsSnap.docs) {
        totalSearches += (c.data() as { searchCount?: number }).searchCount ?? 0;
      }
      // The owner's OWN lookups (users/{schoolId}.searchCount) — a teacher or
      // principal trying Gadit while signed in. These never touch the /c/CODE
      // classroom logs, so a school can show 0 classroom searches yet a high
      // owner count (e.g. Corinne's 99). Surface both so activity is visible.
      const ownerSnap = await db.collection("users").doc(doc.id).get();
      const ownerSearches = (ownerSnap.data()?.searchCount as number) ?? 0;
      return {
        id: doc.id,
        name: (d.name ?? "").trim(),
        contactEmail: d.contactEmail ?? null,
        plan: d.plan ?? "",
        createdAt: d.createdAt ?? null,
        classroomCount: classroomsSnap.size,
        totalSearches,
        ownerSearches,
      };
    }),
  );

  // Most active schools first by TOTAL activity (classroom + owner's own
  // lookups); blank/idle schools sink to the bottom.
  schools.sort((a, b) => (b.totalSearches + b.ownerSearches) - (a.totalSearches + a.ownerSearches));

  return NextResponse.json({
    schools,
    totalSchools: schools.length,
    totalSearches: schools.reduce((s, x) => s + x.totalSearches, 0),
  });
}

/**
 * DELETE /api/admin/schools?schoolId=UID — remove a school entirely.
 *
 * Nukes schools/{uid} and every classroom + searches subcollection under it
 * (recursiveDelete), deletes the classroomCodes/* docs that route to it, and
 * clears the owner user's schoolId so it no longer appears as a school. Does
 * NOT touch Stripe/billing — cancel the subscription separately if needed.
 *
 * For clearing out test/duplicate schools. Admin-gated, irreversible.
 */
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const db = getAdminDb();
  const schoolId = req.nextUrl.searchParams.get("schoolId");
  if (!schoolId) return NextResponse.json({ error: "missing_schoolId" }, { status: 400 });

  const schoolRef = db.collection("schools").doc(schoolId);
  const snap = await schoolRef.get();
  if (!snap.exists) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // classroomCodes routing docs that point at this school.
  const codesSnap = await db.collection("classroomCodes").where("schoolId", "==", schoolId).get();
  await Promise.all(codesSnap.docs.map((d) => d.ref.delete()));

  // The school doc + all classrooms + their searches, in one recursive sweep.
  await db.recursiveDelete(schoolRef);

  // Detach the owner user so they drop out of the schools list. Leaves the
  // account (and any Stripe subscription) intact; billing is handled apart.
  await db.collection("users").doc(schoolId).set({ schoolId: FieldValue.delete() }, { merge: true }).catch(() => {});

  return NextResponse.json({ ok: true, deletedCodes: codesSnap.size });
}
