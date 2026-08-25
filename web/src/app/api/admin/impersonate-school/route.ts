import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

/**
 * POST /api/admin/impersonate-school  { schoolId }
 *
 * Admin-only. Mints a Firebase custom token for the school owner's account so
 * the admin can sign in AS the school and see the real /schools dashboard
 * exactly as the principal does (settings, roster, classrooms, everything).
 * The token carries an `adminImpersonation` claim so the app shows an exit
 * banner. Same session model as coach switch-in: entering replaces the current
 * login; exiting signs out and the admin logs back in as themselves.
 *
 * Restricted to ADMIN_EMAILS. This is a full-access support tool — never widen
 * the gate.
 */

const ADMIN_EMAILS = new Set(["gadibenlavi@gmail.com"]);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return NextResponse.json({ error: "login_required" }, { status: 401 });

  let adminEmail = "";
  try {
    adminEmail = (await getAdminAuth().verifyIdToken(idToken)).email ?? "";
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }
  if (!ADMIN_EMAILS.has(adminEmail)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let schoolId = "";
  try {
    schoolId = String(((await req.json()) as { schoolId?: string }).schoolId ?? "").trim();
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (!schoolId) return NextResponse.json({ error: "missing_schoolId" }, { status: 400 });

  const db = getAdminDb();
  const schoolSnap = await db.collection("schools").doc(schoolId).get();
  if (!schoolSnap.exists) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // The school account must exist as a Firebase user (schoolId === owner uid).
  const auth = getAdminAuth();
  try {
    await auth.getUser(schoolId);
  } catch {
    return NextResponse.json({ error: "owner_account_missing" }, { status: 404 });
  }

  const token = await auth.createCustomToken(schoolId, {
    adminImpersonation: true,
    impersonatedBy: adminEmail,
  });

  const name = ((schoolSnap.data() as { name?: string }).name ?? "").trim();
  return NextResponse.json({ token, name });
}
