import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Admin — strategic marketing plan state, for /admin/strategy.
 *
 *   GET   → { config, progress, alumni }. config is null until seeded.
 *   PATCH → partial MERGE of progress / alumni / config. Never overwrites
 *           the whole doc, so ticking one checkbox keeps the rest.
 *
 * Seeding the immutable plan is a SEPARATE endpoint (./seed) so the plan
 * body — which carries revenue targets and list sizes — never rides in
 * the public repo. If config is missing the UI shows an empty state, it
 * does not fall over.
 *
 * Auth: ADMIN_SECRET via ?secret= (identical to the other admin routes;
 * there is no verifyAdmin helper in this project).
 */

export const maxDuration = 30;

const DEFAULT_ALUMNI_COUNTS = {
  contacted: 0,
  responded: 0,
  codeIssued: 0,
  codeActivated: 0,
  familiesConverted: 0,
  schoolConverted: 0,
};

function gate(req: NextRequest): NextResponse | null {
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
  return null;
}

export async function GET(req: NextRequest) {
  const denied = gate(req);
  if (denied) return denied;

  const db = getAdminDb();
  const [cfg, prog, alum] = await Promise.all([
    db.collection("strategicPlan").doc("config").get(),
    db.collection("strategicPlan").doc("progress").get(),
    db.collection("strategicPlan").doc("alumni").get(),
  ]);

  const p = (prog.exists ? prog.data() : {}) ?? {};
  const a = (alum.exists ? alum.data() : {}) ?? {};

  return NextResponse.json({
    config: cfg.exists ? cfg.data() : null,
    progress: {
      daily: p.daily ?? {},
      weekly: p.weekly ?? {},
      startup: p.startup ?? {},
      channelActual: p.channelActual ?? {},
      monthly: p.monthly ?? {},
    },
    alumni: {
      counts: { ...DEFAULT_ALUMNI_COUNTS, ...(a.counts ?? {}) },
      weekly: a.weekly ?? {},
    },
  });
}

export async function PATCH(req: NextRequest) {
  const denied = gate(req);
  if (denied) return denied;

  let body: {
    progress?: Record<string, unknown>;
    alumni?: Record<string, unknown>;
    config?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const db = getAdminDb();
  const writes: Promise<unknown>[] = [];
  // set(..., { merge: true }) deep-merges map fields, so ticking one day /
  // one channel / one stage leaves every other key untouched. Arrays (a
  // day's task-id list) are replaced wholesale — the client sends the full
  // list for that key.
  if (body.progress) writes.push(db.collection("strategicPlan").doc("progress").set(body.progress, { merge: true }));
  if (body.alumni) writes.push(db.collection("strategicPlan").doc("alumni").set(body.alumni, { merge: true }));
  if (body.config) writes.push(db.collection("strategicPlan").doc("config").set(body.config, { merge: true }));

  if (writes.length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }
  await Promise.all(writes);
  return NextResponse.json({ ok: true });
}
