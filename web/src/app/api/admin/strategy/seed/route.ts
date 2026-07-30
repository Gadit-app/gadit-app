import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Admin — one-shot seeding of the strategic plan config.
 *
 * The plan body carries revenue targets, the alumni strategy and list
 * sizes, so it must NOT live in the public repo. Gadi runs this once from
 * his machine with the local seed file:
 *
 *   curl -X POST "https://www.gadit.app/api/admin/strategy/seed?secret=$ADMIN_SECRET" \
 *        -H "Content-Type: application/json" \
 *        --data-binary @strategic-plan-seed.json
 *
 * Body = the full plan JSON. It overwrites strategicPlan/config (not a
 * merge — re-seeding replaces the whole plan). Progress and alumni state
 * live in separate docs and are never touched here.
 *
 * Auth: ADMIN_SECRET via ?secret= (same gate as ../route.ts).
 */

export const maxDuration = 30;

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

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || !("goal" in body) || !("startupChecklist" in body)) {
    return NextResponse.json(
      { error: "body does not look like a plan config (missing goal / startupChecklist)" },
      { status: 400 },
    );
  }

  const db = getAdminDb();
  await db.collection("strategicPlan").doc("config").set(body);
  return NextResponse.json({ ok: true, version: (body as { version?: number }).version ?? null });
}
