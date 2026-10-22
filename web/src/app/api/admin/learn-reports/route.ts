import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Admin: "wrong translation?" reports from learning-mode word cards
 * (learnReports, written by POST /api/learn-report, 2026-10-22).
 *
 *   GET  ?secret=$ADMIN_SECRET[&status=open|fixed|wontfix]   newest first, up to 300
 *   POST ?secret=$ADMIN_SECRET  { id, status }                 mark one
 */
export const maxDuration = 30;

const STATUSES = ["open", "fixed", "wontfix"] as const;
type Status = (typeof STATUSES)[number];

function gate(req: NextRequest): NextResponse | null {
  if (!process.env.ADMIN_SECRET) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if (req.nextUrl.searchParams.get("secret") !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return null;
}

export async function GET(req: NextRequest) {
  const denied = gate(req);
  if (denied) return denied;
  const status = req.nextUrl.searchParams.get("status");
  const snap = await getAdminDb().collection("learnReports").orderBy("lastAt", "desc").limit(300).get();
  const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) })) as Array<{ id: string; status?: string }>;
  const counts = { open: 0, fixed: 0, wontfix: 0, total: all.length };
  for (const r of all) if (r.status && r.status in counts) counts[r.status as Status] += 1;
  const items = STATUSES.includes(status as Status) ? all.filter((r) => r.status === status) : all;
  return NextResponse.json({ items, counts });
}

export async function POST(req: NextRequest) {
  const denied = gate(req);
  if (denied) return denied;
  const b = (await req.json().catch(() => ({}))) as { id?: unknown; status?: unknown };
  const id = typeof b.id === "string" ? b.id : "";
  if (!id || id.includes("/") || !STATUSES.includes(b.status as Status)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const ref = getAdminDb().collection("learnReports").doc(id);
  if (!(await ref.get()).exists) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await ref.set({ status: b.status, updatedAt: new Date().toISOString() }, { merge: true });
  return NextResponse.json({ ok: true });
}
