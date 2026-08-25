import { NextRequest, NextResponse } from "next/server";
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
    };
    const insights = await computeSchoolInsights(db, schoolId);
    return NextResponse.json({
      school: {
        id: schoolId,
        name: (meta.name ?? "").trim(),
        contactEmail: meta.contactEmail ?? null,
        plan: meta.plan ?? "",
        createdAt: meta.createdAt ?? null,
      },
      ...insights,
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
      return {
        id: doc.id,
        name: (d.name ?? "").trim(),
        contactEmail: d.contactEmail ?? null,
        plan: d.plan ?? "",
        createdAt: d.createdAt ?? null,
        classroomCount: classroomsSnap.size,
        totalSearches,
      };
    }),
  );

  // Most active schools first; blank/idle schools sink to the bottom.
  schools.sort((a, b) => b.totalSearches - a.totalSearches);

  return NextResponse.json({
    schools,
    totalSchools: schools.length,
    totalSearches: schools.reduce((s, x) => s + x.totalSearches, 0),
  });
}
