import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("secret") !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const auth = getAdminAuth();
  const db = getAdminDb();
  const uids: string[] = [];
  let pageToken: string | undefined;
  do { const page = await auth.listUsers(1000, pageToken); page.users.forEach(u => uids.push(u.uid)); pageToken = page.pageToken; } while (pageToken);
  const refs = uids.map(uid => db.collection("users").doc(uid));
  const snaps = await db.getAll(...refs);
  const out = snaps.map((s, i) => ({
    uid: uids[i].slice(0,12),
    exists: s.exists,
    notifiedSignup: s.data()?.notifiedSignup ?? null,
    keys: s.exists ? Object.keys(s.data() ?? {}) : [],
  }));
  return NextResponse.json(out);
}
