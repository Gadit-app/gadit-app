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

  // Resolve subscriber emails in one batched read.
  const uids = [...new Set(rows.map((r) => r.uid).filter((u): u is string => !!u))];
  const emailByUid: Record<string, string | null> = {};
  if (uids.length) {
    try {
      const refs = uids.map((u) => db.collection("users").doc(u));
      const docs = await db.getAll(...refs);
      for (const d of docs) {
        if (d.exists) emailByUid[d.id] = (d.data()?.email as string | undefined) ?? null;
      }
    } catch {
      // best-effort — rows still render with uid short-code if email lookup fails
    }
  }

  const items = rows.map((r) => ({
    kind: r.kind ?? "word",
    word: r.word ?? "",
    lang: r.lang ?? "en",
    uid: r.uid ?? null,
    plan: r.plan ?? (r.uid ? "unknown" : "anon"),
    email: r.uid ? emailByUid[r.uid] ?? null : null,
    country: r.country ?? null,
    ua: r.ua ?? null,
    isBot: r.isBot === true,
    atMs: r.atMs ?? 0,
    at: r.at ?? null,
  }));

  const nextBefore = items.length === limit ? items[items.length - 1].atMs : null;

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    count: items.length,
    nextBefore,
    items,
  });
}
