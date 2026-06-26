import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type { UserRecord } from "firebase-admin/auth";

/**
 * Admin tool — campaign / UTM attribution for the /admin/campaigns page.
 *
 * Joins Firebase Auth user metadata (signup date, plan via Firestore)
 * with the utm_* fields persisted on each /users/{uid} doc by the
 * notify-signup endpoint, and reports:
 *
 *   - Per-source totals: signups, paid conversions, conversion rate
 *   - Per-(source, medium, campaign) breakdown for finer attribution
 *   - Recent attributed signups (last 50) for spot-checking
 *
 * USAGE:
 *   GET /api/admin/campaigns?secret=$ADMIN_SECRET
 *   Optional: &since=YYYY-MM-DD   only count signups on/after this date
 *                                  (defaults to 90 days ago)
 *
 * Auth: ADMIN_SECRET env var.
 */

export const maxDuration = 60;

type Plan = "basic" | "clear" | "deep";

type SourceRow = {
  source: string;
  signups: number;
  paid: number;
  conversionPct: number;   // % of signups that became paid, 0.0, 100.0
  byMedium: Record<string, number>;
  byCampaign: Record<string, number>;
};

type AttributedSignup = {
  uid: string;
  email: string | null;
  createdAt: string | null;
  plan: Plan;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  landingPath: string | null;
  country: string | null;
};

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

  const sinceStr = req.nextUrl.searchParams.get("since") ?? "";
  const sinceMs = sinceStr
    ? new Date(sinceStr).getTime()
    : Date.now() - 90 * 86_400_000;

  const auth = getAdminAuth();
  const db = getAdminDb();

  // ---------- 1) Auth users (paginated) ----------
  const authUsers: UserRecord[] = [];
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    authUsers.push(...page.users);
    pageToken = page.pageToken;
    if (authUsers.length >= 5000) break;
  } while (pageToken);

  // ---------- 2) Firestore user docs in bulk ----------
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

  // ---------- 3) Filter to signups since `sinceMs` and aggregate ----------
  // Source aggregation: group by utmSource. "direct" bucket for users
  // who signed up without any UTM (Google search / direct traffic /
  // referrer-less). Showing direct alongside attributed sources lets
  // Gadi see what fraction of traffic the campaign is responsible for.
  const sourceMap = new Map<string, SourceRow>();
  const recent: AttributedSignup[] = [];

  for (const u of authUsers) {
    const created = u.metadata.creationTime
      ? new Date(u.metadata.creationTime).getTime()
      : 0;
    if (created < sinceMs) continue;

    const d = userDocs.get(u.uid) ?? {};
    const plan = (d.plan as Plan) || "basic";
    const source = (d.utmSource as string) || "direct";
    const medium = (d.utmMedium as string) || "";
    const campaign = (d.utmCampaign as string) || "";

    if (!sourceMap.has(source)) {
      sourceMap.set(source, {
        source,
        signups: 0,
        paid: 0,
        conversionPct: 0,
        byMedium: {},
        byCampaign: {},
      });
    }
    const row = sourceMap.get(source)!;
    row.signups++;
    if (plan === "clear" || plan === "deep") row.paid++;
    if (medium) row.byMedium[medium] = (row.byMedium[medium] ?? 0) + 1;
    if (campaign) row.byCampaign[campaign] = (row.byCampaign[campaign] ?? 0) + 1;

    if (d.utmSource) {
      // Only include attributed signups in the "recent" list (the table
      // exists to spot-check the attribution data, not list every user).
      recent.push({
        uid: u.uid,
        email: u.email ?? null,
        createdAt: u.metadata.creationTime
          ? new Date(u.metadata.creationTime).toISOString()
          : null,
        plan,
        source: (d.utmSource as string) ?? null,
        medium: (d.utmMedium as string) ?? null,
        campaign: (d.utmCampaign as string) ?? null,
        landingPath: (d.utmLandingPath as string) ?? null,
        country: (d.country as string) ?? null,
      });
    }
  }

  // Finalise conversion rates and sort
  const sources = Array.from(sourceMap.values()).map((r) => {
    r.conversionPct = r.signups > 0
      ? Math.round((r.paid / r.signups) * 1000) / 10
      : 0;
    return r;
  }).sort((a, b) => b.signups - a.signups);

  recent.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  return NextResponse.json({
    since: new Date(sinceMs).toISOString(),
    totals: {
      attributedSignups: recent.length,
      directSignups: sources.find((s) => s.source === "direct")?.signups ?? 0,
      allSignups: sources.reduce((acc, s) => acc + s.signups, 0),
    },
    sources,
    recent: recent.slice(0, 50),
  });
}
