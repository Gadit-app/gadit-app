import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type { UserRecord } from "firebase-admin/auth";

/**
 * Admin tool — list every Firebase Auth user, joined with their Firestore
 * /users/{uid} doc, for the /admin/users dashboard.
 *
 * USAGE:
 *   GET /api/admin/users?secret=$ADMIN_SECRET
 *   Optional: &search=<email-fragment>   filter by email substring
 *             &plan=basic|clear|deep     filter by plan
 *             &country=IL                filter by ISO-2 country
 *             &limit=500                 default 2000 (Firebase Auth max
 *                                        per page is 1000, we paginate)
 *
 * Auth: ADMIN_SECRET env var. Refuses to run if unset.
 *
 * Returns: {
 *   total: number,
 *   users: Array<{
 *     uid, email, createdAt, lastSignInAt, providers: string[],
 *     emailVerified: bool, disabled: bool,
 *     plan, country, lastSeenAt, searchCount, lastSearchAt,
 *     stripeCustomerId, subscriptionStatus,
 *   }>
 * }
 *
 * Joins:
 *   - Auth fields come from firebase-admin Auth (no per-user network call —
 *     listUsers() returns metadata in one page).
 *   - Firestore fields come from /users/{uid} in one bulk getAll() pass
 *     (chunked by 500 — Firestore's getAll cap).
 *   Total: 2 RPCs per ~500 users, no N+1.
 */

export const maxDuration = 60;

type Plan = "basic" | "clear" | "deep";

type AdminUserRow = {
  uid: string;
  email: string | null;
  displayName: string | null;      // Firebase Auth displayName ("First Last")
  createdAt: string | null;        // ISO
  lastSignInAt: string | null;     // ISO
  providers: string[];
  emailVerified: boolean;
  disabled: boolean;
  plan: Plan;
  country: string | null;
  lastSeenAt: string | null;       // ISO (Firestore Timestamp.toDate)
  searchCount: number;
  lastSearchAt: string | null;     // ISO
  stripeCustomerId: string | null;
  subscriptionStatus: string | null;
};

function tsToIso(v: unknown): string | null {
  if (!v) return null;
  // Firestore Timestamp has toDate()
  if (typeof v === "object" && v !== null && "toDate" in v && typeof (v as { toDate: () => Date }).toDate === "function") {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "number") return new Date(v).toISOString();
  if (typeof v === "string") return v;
  return null;
}

export async function GET(req: NextRequest) {
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

  const searchQ = (req.nextUrl.searchParams.get("search") ?? "").trim().toLowerCase();
  const planQ   = req.nextUrl.searchParams.get("plan") as Plan | null;
  const countryQ = (req.nextUrl.searchParams.get("country") ?? "").trim().toUpperCase();
  const limit = Math.min(
    Math.max(parseInt(req.nextUrl.searchParams.get("limit") ?? "2000", 10) || 2000, 1),
    5000,
  );

  const auth = getAdminAuth();
  const db   = getAdminDb();

  // ---------- 1) List every Auth user, paginated ----------
  const authUsers: UserRecord[] = [];
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    authUsers.push(...page.users);
    pageToken = page.pageToken;
    if (authUsers.length >= limit) break;
  } while (pageToken);

  // ---------- 2) Bulk-load matching /users/{uid} Firestore docs ----------
  // getAll has no documented cap but cloud-firestore-admin chokes past ~500
  // refs in a single call — chunk for safety.
  const userDocs = new Map<string, FirebaseFirestore.DocumentData>();
  const CHUNK = 400;
  for (let i = 0; i < authUsers.length; i += CHUNK) {
    const refs = authUsers
      .slice(i, i + CHUNK)
      .map((u) => db.collection("users").doc(u.uid));
    const snaps = await db.getAll(...refs);
    for (const snap of snaps) {
      if (snap.exists) userDocs.set(snap.id, snap.data() ?? {});
    }
  }

  // ---------- 3) Project + filter ----------
  const rows: AdminUserRow[] = authUsers.map((u) => {
    const d = userDocs.get(u.uid) ?? {};
    // displayName comes from Firebase Auth (set automatically on Google
    // signup, optionally on email signup). If Auth doesn't have it,
    // fall back to a `displayName` / `name` field on the Firestore
    // /users/{uid} doc — some older accounts have it stored there only.
    const displayName =
      (typeof u.displayName === "string" && u.displayName.trim()) ? u.displayName.trim() :
      (typeof d.displayName === "string" && d.displayName.trim()) ? (d.displayName as string).trim() :
      (typeof d.name === "string" && (d.name as string).trim()) ? (d.name as string).trim() :
      null;
    return {
      uid: u.uid,
      email: u.email ?? null,
      displayName,
      createdAt: u.metadata.creationTime ? new Date(u.metadata.creationTime).toISOString() : null,
      lastSignInAt: u.metadata.lastSignInTime ? new Date(u.metadata.lastSignInTime).toISOString() : null,
      providers: u.providerData.map((p) => p.providerId),
      emailVerified: u.emailVerified,
      disabled: u.disabled,
      plan: (d.plan as Plan) || "basic",
      country: (d.country as string) ?? null,
      lastSeenAt: tsToIso(d.lastSeenAt),
      searchCount: typeof d.searchCount === "number" ? d.searchCount : 0,
      lastSearchAt: tsToIso(d.lastSearchAt),
      stripeCustomerId: (d.stripeCustomerId as string) ?? null,
      subscriptionStatus: (d.subscriptionStatus as string) ?? null,
    };
  });

  const filtered = rows.filter((r) => {
    if (searchQ && !(r.email ?? "").toLowerCase().includes(searchQ)) return false;
    if (planQ && r.plan !== planQ) return false;
    if (countryQ && (r.country ?? "") !== countryQ) return false;
    return true;
  });

  // Sort: newest signups first by default.
  filtered.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  // ---------- 4) Aggregates for the dashboard header ----------
  // "Paying" = went through Stripe Checkout and currently has an active
  // or trialing subscription. Gadi (2026-06-29) flagged that the plain
  // byPlan.deep count was misleading because it inflates with manually-
  // granted Family members, manual Schools trials, and other non-paying
  // upgrades. The paying counts answer "how many people have given us
  // real money this month" honestly.
  const isPayingRow = (r: typeof rows[number]) =>
    r.subscriptionStatus === "active" || r.subscriptionStatus === "trialing";
  const paying = rows.filter(isPayingRow);
  const counts = {
    total: rows.length,
    filtered: filtered.length,
    byPlan: {
      basic: rows.filter((r) => r.plan === "basic").length,
      clear: rows.filter((r) => r.plan === "clear").length,
      deep:  rows.filter((r) => r.plan === "deep").length,
    },
    paying: {
      total: paying.length,
      clear: paying.filter((r) => r.plan === "clear").length,
      deep:  paying.filter((r) => r.plan === "deep").length,
    },
    byCountry: Object.fromEntries(
      Object.entries(
        rows.reduce<Record<string, number>>((acc, r) => {
          const k = r.country ?? "?";
          acc[k] = (acc[k] ?? 0) + 1;
          return acc;
        }, {}),
      ).sort((a, b) => b[1] - a[1]),
    ),
    signupsLast7Days: rows.filter((r) => {
      if (!r.createdAt) return false;
      const t = new Date(r.createdAt).getTime();
      return Date.now() - t < 7 * 86_400_000;
    }).length,
    signupsLast30Days: rows.filter((r) => {
      if (!r.createdAt) return false;
      const t = new Date(r.createdAt).getTime();
      return Date.now() - t < 30 * 86_400_000;
    }).length,
  };

  return NextResponse.json({ counts, users: filtered });
}
