import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type { UserRecord } from "firebase-admin/auth";

/**
 * Read-only subscriber export for the New Education college WordPress
 * sync (Gadi 2026-07-26). The college cross-references its students
 * against Gadit signups by email, so it needs a flat list of every
 * registered Gadit user with their email, status and signup date.
 *
 * SECURITY: gated by a DEDICATED token (GADIT_SYNC_TOKEN), NOT the full
 * ADMIN_SECRET. This endpoint can only READ the email list; the sync
 * token grants no other admin power, so a compromised WordPress server
 * exposes emails only, never the ability to delete users or read
 * billing internals. Least privilege on purpose.
 *
 * USAGE:
 *   GET /api/sync/users
 *   Auth: Authorization: Bearer <GADIT_SYNC_TOKEN>   (or ?token=<...>)
 *   Optional: ?status=active   -> only paying subscribers
 *
 * RESPONSE (bare JSON array, one row per user that has an email):
 *   [
 *     { "email": "parent@example.com", "status": "active",
 *       "plan": "deep", "created_at": "2026-01-05" },
 *     ...
 *   ]
 *   X-Total-Count header carries the row count.
 *
 * status: "active"  = paying subscriber (subscriptionStatus active or
 *                     trialing, on a paid plan, not a comp account)
 *         "registered" = has an account but is not currently paying
 * plan:  "basic" | "clear" | "deep"  (Family/Schools bill as "deep")
 */

export const maxDuration = 60;

type Row = { email: string; status: "active" | "registered"; plan: string; created_at: string };

export async function GET(req: NextRequest) {
  const expected = process.env.GADIT_SYNC_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "GADIT_SYNC_TOKEN not configured on the server, refusing to run" },
      { status: 503 },
    );
  }
  const authHeader = req.headers.get("authorization") || "";
  const bearer = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
  const token = bearer || (req.nextUrl.searchParams.get("token") ?? "");
  if (token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const onlyActive = req.nextUrl.searchParams.get("status") === "active";

  const auth = getAdminAuth();
  const db = getAdminDb();

  // All Auth users (paginated), then their Firestore docs in bulk.
  const authUsers: UserRecord[] = [];
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    authUsers.push(...page.users);
    pageToken = page.pageToken;
    if (authUsers.length >= 10000) break;
  } while (pageToken);

  const docs = new Map<string, FirebaseFirestore.DocumentData>();
  const CHUNK = 400;
  for (let i = 0; i < authUsers.length; i += CHUNK) {
    const refs = authUsers.slice(i, i + CHUNK).map((u) => db.collection("users").doc(u.uid));
    const snaps = await db.getAll(...refs);
    for (const snap of snaps) if (snap.exists) docs.set(snap.id, snap.data() ?? {});
  }

  const rows: Row[] = [];
  for (const u of authUsers) {
    const d = docs.get(u.uid) ?? {};
    const email = u.email ?? (typeof d.email === "string" ? (d.email as string) : null);
    if (!email) continue; // no email = useless for cross-referencing

    const plan = (d.plan as string) || "basic";
    const subStatus = (d.subscriptionStatus as string) || "";
    const comp = d.comp === true;
    const paying = !comp && plan !== "basic" && (subStatus === "active" || subStatus === "trialing");
    if (onlyActive && !paying) continue;

    const created = u.metadata.creationTime
      ? new Date(u.metadata.creationTime).toISOString().slice(0, 10)
      : "";

    rows.push({
      email: email.toLowerCase(),
      status: paying ? "active" : "registered",
      plan,
      created_at: created,
    });
  }

  return NextResponse.json(rows, {
    headers: {
      "X-Total-Count": String(rows.length),
      "Cache-Control": "no-store",
    },
  });
}
