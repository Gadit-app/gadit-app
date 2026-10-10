import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

/**
 * Admin — failed sign-ins, for /admin/auth-errors (Gadi 2026-10-10).
 * GET → the last 400 failures grouped by address, newest first, each with
 * what the account really is (exists? Google or password? last sign-in?),
 * so a stuck person can be helped before they complain.
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

type Row = { email: string | null; code: string; mode: string; page: string; lang: string; ua: string; at: string };

export async function GET(req: NextRequest) {
  const denied = gate(req);
  if (denied) return denied;

  const snap = await getAdminDb().collection("authErrors").orderBy("at", "desc").limit(400).get();
  const rows = snap.docs.map((d) => d.data() as Row);
  const groups = new Map<string, { email: string | null; count: number; last: string; first: string; codes: Record<string, number>; pages: string[]; modes: string[] }>();
  for (const r of rows) {
    const k = r.email || `(${r.mode || "no email"})`;
    const g = groups.get(k) ?? { email: r.email, count: 0, last: r.at, first: r.at, codes: {}, pages: [], modes: [] };
    g.count++;
    g.first = r.at;
    g.codes[r.code] = (g.codes[r.code] ?? 0) + 1;
    if (r.page && !g.pages.includes(r.page) && g.pages.length < 3) g.pages.push(r.page);
    if (r.mode && !g.modes.includes(r.mode)) g.modes.push(r.mode);
    groups.set(k, g);
  }
  const list = [...groups.values()].sort((a, b) => b.last.localeCompare(a.last));
  // What each account really is, for the 60 most recent addresses.
  const auth = getAdminAuth();
  const out = await Promise.all(list.map(async (g, i) => {
    if (!g.email || i >= 60) return { ...g, account: null };
    try {
      const u = await auth.getUserByEmail(g.email);
      return { ...g, account: { exists: true, providers: u.providerData.map((p) => p.providerId), lastSignIn: u.metadata.lastSignInTime ?? null, created: u.metadata.creationTime ?? null } };
    } catch {
      return { ...g, account: { exists: false } };
    }
  }));
  // Did they get in after the failure? (signed in later than the last failure)
  const enriched = out.map((g) => {
    const acc = g.account as { exists?: boolean; lastSignIn?: string | null } | null;
    const recovered = !!acc?.lastSignIn && new Date(acc.lastSignIn).getTime() > new Date(g.last).getTime();
    return { ...g, recovered };
  });
  return NextResponse.json({ groups: enriched, total: rows.length });
}
