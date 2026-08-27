import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

/**
 * POST /api/admin/exit-impersonation
 *
 * The counterpart to /api/admin/impersonate-school. When an admin has signed in
 * AS a school (a session carrying `adminImpersonation: true` and `impersonatedBy:
 * <adminEmail>`), this mints a custom token for the ADMIN's own account so
 * exiting returns them to their real login instead of signing them out.
 *
 * Safe because it only acts on a session that already IS an admin impersonation
 * (the claim proves it), and only returns to the admin named in the claim, who
 * must still be a listed admin.
 */

const ADMIN_EMAILS = new Set(["gadibenlavi@gmail.com"]);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return NextResponse.json({ error: "login_required" }, { status: 401 });

  const auth = getAdminAuth();
  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  // Must be an active admin-impersonation session, returning to a real admin.
  const impersonatedBy = typeof decoded.impersonatedBy === "string" ? decoded.impersonatedBy : "";
  if (decoded.adminImpersonation !== true || !ADMIN_EMAILS.has(impersonatedBy)) {
    return NextResponse.json({ error: "not_impersonating" }, { status: 403 });
  }

  try {
    const adminUser = await auth.getUserByEmail(impersonatedBy);
    const token = await auth.createCustomToken(adminUser.uid);
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "admin_account_missing" }, { status: 404 });
  }
}
