import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Admin — the account-deletion audit log, for /admin/deletions.
 * GET → the most recent deletions (self + admin), newest first.
 * Auth: ADMIN_SECRET via ?secret= (same as the sibling admin routes).
 */

export const maxDuration = 30;

function gate(req: NextRequest): NextResponse | null {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return null;
}

export async function GET(req: NextRequest) {
  const denied = gate(req);
  if (denied) return denied;

  const db = getAdminDb();
  // orderBy on the `at` string (ISO, lexicographically sortable) newest first.
  const snap = await db.collection("deletionLog").orderBy("at", "desc").limit(300).get();
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
  return NextResponse.json({ rows });
}
