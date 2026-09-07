import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Admin — raw activity log. Every word search and image generation as its
 * own row, newest first, with time / word / language / and WHO did it.
 * Reads the `activityLog` collection (lib/activity-log.ts). Subscriber
 * emails are resolved here (batched) from the users collection so rows stay
 * PII-light at write time.
 *
 * USAGE: GET /api/admin/activity?secret=$ADMIN_SECRET&limit=200&before=<atMs>
 *   before = the previous page's oldest atMs, for "load more".
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type Row = {
  kind?: string;
  word?: string;
  lang?: string;
  uid?: string | null;
  plan?: string | null;
  country?: string | null;
  ua?: string | null;
  isBot?: boolean;
  atMs?: number;
  at?: string;
};

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET env var not configured, refusing to run" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const limit = Math.min(500, Math.max(1, Number(req.nextUrl.searchParams.get("limit")) || 200));
  const before = Number(req.nextUrl.searchParams.get("before")) || 0;

  const db = getAdminDb();
  let q = db.collection("activityLog").orderBy("atMs", "desc");
  if (before > 0) q = q.startAfter(before);

  let rows: Row[] = [];
  try {
    const snap = await q.limit(limit).get();
    rows = snap.docs.map((d) => d.data() as Row);
  } catch (e) {
    return NextResponse.json({ error: "read_failed", details: String(e) }, { status: 500 });
  }

  // Resolve subscriber emails + true tier in one batched read. Schools and
  // Families both store plan="deep" and are distinguished by schoolId/familyId,
  // so the raw plan field mislabels them (Gadi 2026-09-07: a school owner showed
  // as "deep"). Reclassify here so the log shows "School"/"Family" correctly.
  const uids = [...new Set(rows.map((r) => r.uid).filter((u): u is string => !!u))];
  const infoByUid: Record<string, { email: string | null; tier: string | null }> = {};
  if (uids.length) {
    try {
      const refs = uids.map((u) => db.collection("users").doc(u));
      const docs = await db.getAll(...refs);
      for (const d of docs) {
        if (!d.exists) continue;
        const data = d.data() ?? {};
        const tier = data.schoolId ? "schools" : data.familyId ? "family" : null;
        infoByUid[d.id] = { email: (data.email as string | undefined) ?? null, tier };
      }
    } catch {
      // best-effort — rows still render with uid short-code if the lookup fails
    }
  }

  const items = rows.map((r) => {
    const info = r.uid ? infoByUid[r.uid] : undefined;
    const plan = info?.tier ?? r.plan ?? (r.uid ? "unknown" : "anon");
    return {
    kind: r.kind ?? "word",
    word: r.word ?? "",
    lang: r.lang ?? "en",
    uid: r.uid ?? null,
    plan,
    email: r.uid ? info?.email ?? null : null,
    country: r.country ?? null,
    ua: r.ua ?? null,
    isBot: r.isBot === true,
    atMs: r.atMs ?? 0,
    at: r.at ?? null,
    };
  });

  const nextBefore = items.length === limit ? items[items.length - 1].atMs : null;

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    count: items.length,
    nextBefore,
    items,
  });
}
