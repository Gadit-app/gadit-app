import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { computeSchoolInsights } from "@/lib/school-insights";
import { SCHOOL_TYPES, cleanLevels, cleanCurriculum } from "@/lib/school-levels";
import { isInternalEmail } from "@/lib/internal-accounts";
import { studentCodesOff } from "@/lib/school";
import { SCHOOL_DRIP } from "@/lib/email-drip/school-drip";

/** Y-M-D in Israel, the same day key /api/schools/projection writes. */
function ilDay(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));
}

/** createdAt is an ISO string on most schools, a Timestamp on a few. */
function isoOf(v: unknown): string | null {
  if (typeof v === "string") return v;
  const t = v as { toDate?: () => Date } | null;
  return t?.toDate ? t.toDate().toISOString() : null;
}

/**
 * Admin-only cross-school view.
 *
 * GET /api/admin/schools               → list every school (name, contact,
 *                                          plan, curriculum, pilot day, series
 *                                          emails, checklist, words, projector
 *                                          use this week; internal + demo
 *                                          schools flagged, kept out of totals)
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
      levels?: unknown;
      curriculum?: unknown;
      isDemo?: boolean;
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
        levels: cleanLevels(meta.levels),
        curriculum: cleanCurriculum(meta.curriculum, cleanLevels(meta.levels)),
        plan: meta.plan ?? "",
        createdAt: isoOf(meta.createdAt),
        isDemo: meta.isDemo === true,
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
  const now = Date.now();
  const since7 = ilDay(now - 6 * 86_400_000);
  // Owner emails in one call (the school id is the owner's uid), so a school
  // whose doc has no contactEmail can still be recognised as internal.
  const authEmails = new Map<string, string>();
  for (let i = 0; i < schoolsSnap.docs.length; i += 100) {
    const ids = schoolsSnap.docs.slice(i, i + 100).map((d) => ({ uid: d.id }));
    try {
      const r = await getAdminAuth().getUsers(ids);
      for (const u of r.users) if (u.email) authEmails.set(u.uid, u.email);
    } catch { /* emails fall back to the docs */ }
  }

  const schools = await Promise.all(
    schoolsSnap.docs.map(async (doc) => {
      const d = doc.data() as {
        name?: string;
        contactEmail?: string | null;
        plan?: string;
        createdAt?: unknown;
        curriculum?: string;
        logoUrl?: string | null;
        uniqueWordCount?: number;
        checklist?: { activity?: string; teachers?: string };
        isDemo?: boolean;
      };
      // Cheap roll-up: read classroom docs only (not their searches) so the
      // list stays fast no matter how much a school has searched.
      const [classroomsSnap, ownerSnap, projSnap] = await Promise.all([
        doc.ref.collection("classrooms").get(),
        db.collection("users").doc(doc.id).get(),
        doc.ref.collection("projections").where("day", ">=", since7).select("count").get(),
      ]);
      let totalSearches = 0;
      for (const c of classroomsSnap.docs) {
        totalSearches += (c.data() as { searchCount?: number }).searchCount ?? 0;
      }
      const owner = ownerSnap.data() ?? {};
      // The owner's OWN lookups (users/{schoolId}.searchCount): a teacher or
      // principal using Gadit while signed in (the projector, in Israel).
      const ownerSearches = (owner.searchCount as number) ?? 0;
      const ownerEmail = authEmails.get(doc.id) ?? (typeof owner.email === "string" ? owner.email : null) ?? d.contactEmail ?? null;
      const internal = isInternalEmail(ownerEmail) || isInternalEmail(d.contactEmail);

      const createdAt = isoOf(d.createdAt);
      const curriculum = typeof d.curriculum === "string" ? d.curriculum : "";
      const codesOff = studentCodesOff(curriculum);

      // Pilot day N of 30: from the day the onboarding series started, else
      // from the day the school was opened.
      const seriesStart = typeof owner.schoolSeriesStart === "string" ? owner.schoolSeriesStart : null;
      const startMs = Date.parse(seriesStart ?? createdAt ?? "");
      const pilotDay = Number.isFinite(startMs) ? Math.max(1, Math.floor((now - startMs) / 86_400_000) + 1) : null;

      const sent = (owner.schoolDripSent ?? {}) as Record<string, { sentAt?: unknown } | undefined>;
      const seriesSent = SCHOOL_DRIP.filter((m) => !!sent[m.key]?.sentAt).length;

      const uniqueWordCount = Number(d.uniqueWordCount ?? 0);
      const steps = {
        curriculum: !!curriculum,
        classroom: classroomsSnap.size > 0,
        lesson: uniqueWordCount > 0,
        activity: !!d.checklist?.activity,
        teachers: !!d.checklist?.teachers,
        logo: !!d.logoUrl,
      };
      const projections7d = projSnap.docs.reduce((n, p) => n + Number(p.get("count") ?? 0), 0);

      return {
        id: doc.id,
        name: (d.name ?? "").trim(),
        contactEmail: d.contactEmail ?? ownerEmail,
        plan: d.plan ?? "",
        createdAt,
        internal,
        isDemo: d.isDemo === true,
        curriculum,
        codesOff,
        pilotDay,
        seriesStarted: !!seriesStart,
        seriesSent,
        seriesTotal: SCHOOL_DRIP.length,
        checklistDone: Object.values(steps).filter(Boolean).length,
        checklistTotal: Object.keys(steps).length,
        steps,
        uniqueWordCount,
        projections7d,
        classroomCount: classroomsSnap.size,
        totalSearches,
        ownerSearches,
      };
    }),
  );

  // Customers first, most active first (projector this week, then lookups);
  // our own and demo schools sink to the bottom.
  schools.sort((a, b) =>
    Number(a.internal || a.isDemo) - Number(b.internal || b.isDemo) ||
    b.projections7d - a.projections7d ||
    (b.totalSearches + b.ownerSearches) - (a.totalSearches + a.ownerSearches));

  // Totals count real schools only: never ours, never a demo.
  const real = schools.filter((x) => !x.internal && !x.isDemo);
  return NextResponse.json({
    schools,
    totalSchools: real.length,
    internalSchools: schools.length - real.length,
    totalSearches: real.reduce((s, x) => s + x.totalSearches, 0),
    totalProjections7d: real.reduce((s, x) => s + x.projections7d, 0),
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
/** PATCH { schoolId, type } sets which school levels the word sets open
 *  to (lib/school-levels.ts). type "" clears it, so the school picks again.
 *  PATCH { schoolId, isDemo } turns the demo flag on or off. */
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  const { schoolId, type, isDemo } = (await req.json().catch(() => ({}))) as { schoolId?: string; type?: string; isDemo?: unknown };
  if (!schoolId) return NextResponse.json({ error: "schoolId required" }, { status: 400 });
  const ref = getAdminDb().collection("schools").doc(schoolId);
  if (!(await ref.get()).exists) return NextResponse.json({ error: "not_found" }, { status: 404 });
  // { schoolId, isDemo } marks a demo school: it never gets the pilot email
  // series (cron/email-drip) and never counts in the admin totals.
  if (typeof isDemo === "boolean") {
    await ref.set({ isDemo: isDemo ? true : FieldValue.delete() }, { merge: true });
    return NextResponse.json({ isDemo });
  }
  if (!type) {
    await ref.set({ levels: FieldValue.delete(), schoolType: FieldValue.delete(), curriculum: FieldValue.delete() }, { merge: true });
    return NextResponse.json({ levels: [] });
  }
  const t = SCHOOL_TYPES.find((x) => x.key === type);
  if (!t) return NextResponse.json({ error: "bad_type" }, { status: 400 });
  await ref.set({ levels: t.levels, curriculum: t.curriculum, schoolType: t.key, levelsSetAt: new Date().toISOString() }, { merge: true });
  return NextResponse.json({ levels: t.levels, curriculum: t.curriculum });
}

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
