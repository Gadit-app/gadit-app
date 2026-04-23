import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";

/**
 * Admin-only API to list and update error reports.
 *
 * Authentication: requires a valid Firebase ID token AND the email on the
 * decoded token must be in ADMIN_EMAILS. Anyone else gets 403.
 *
 * GET  /api/admin/reports                  → list all reports, newest first
 * GET  /api/admin/reports?status=open     → filter by status
 * POST /api/admin/reports                  → { id, status?, adminNote? }
 *                                            updates a report
 */

const ADMIN_EMAILS = new Set(["gadibenlavi@gmail.com"]);

const ALLOWED_STATUSES = ["open", "reviewed", "fixed", "wontfix"] as const;
type ReportStatus = (typeof ALLOWED_STATUSES)[number];

async function requireAdmin(req: NextRequest): Promise<
  | { ok: true; email: string }
  | { ok: false; response: NextResponse }
> {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) {
    return {
      ok: false,
      response: NextResponse.json({ error: "login_required" }, { status: 401 }),
    };
  }
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const email = decoded.email ?? "";
    if (!ADMIN_EMAILS.has(email)) {
      return {
        ok: false,
        response: NextResponse.json({ error: "forbidden" }, { status: 403 }),
      };
    }
    return { ok: true, email };
  } catch (e) {
    console.error("admin auth failed:", e);
    return {
      ok: false,
      response: NextResponse.json({ error: "invalid_token" }, { status: 401 }),
    };
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "200"), 500);

    const db = getAdminDb();
    let q: FirebaseFirestore.Query = db.collection("errorReports");

    if (statusFilter && ALLOWED_STATUSES.includes(statusFilter as ReportStatus)) {
      q = q.where("status", "==", statusFilter);
    }

    const snap = await q.orderBy("createdAt", "desc").limit(limit).get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Counts per status (cheap aggregation)
    const allSnap = await db.collection("errorReports").select("status").get();
    const counts: Record<string, number> = { open: 0, reviewed: 0, fixed: 0, wontfix: 0, total: allSnap.size };
    for (const doc of allSnap.docs) {
      const s = (doc.data().status as string) || "open";
      if (s in counts) counts[s]++;
    }

    return NextResponse.json({ items, counts });
  } catch (err) {
    console.error("admin reports GET error:", err);
    return NextResponse.json({ error: "internal_error", details: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id, status, adminNote } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const update: Record<string, unknown> = {};
    if (status && ALLOWED_STATUSES.includes(status)) {
      update.status = status;
    }
    if (typeof adminNote === "string") {
      update.adminNote = adminNote.slice(0, 1000);
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
    }
    update.updatedAt = new Date().toISOString();
    update.updatedBy = auth.email;

    const db = getAdminDb();
    await db.collection("errorReports").doc(id).update(update);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("admin reports POST error:", err);
    return NextResponse.json({ error: "internal_error", details: String(err) }, { status: 500 });
  }
}
