import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { customerCategory, type CustomerCategory } from "@/lib/internal-accounts";

/**
 * Admin-only API to list and update error reports.
 *
 * Authentication, either of:
 *   - ADMIN_SECRET via ?secret= (same as the sibling admin routes; this is
 *     what /admin/reports uses), or
 *   - a Firebase ID token (Authorization: Bearer) whose email is in
 *     ADMIN_EMAILS. Anyone else gets 401/403.
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
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== null) {
    const expected = process.env.ADMIN_SECRET;
    if (!expected) {
      return { ok: false, response: NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 }) };
    }
    if (secret !== expected) {
      return { ok: false, response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
    }
    return { ok: true, email: "admin-secret" };
  }
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

    // Always order by createdAt only (single-field index that Firestore creates
    // automatically). Filter by status in-memory afterwards. This avoids needing
    // a composite index, which is overkill for an admin dashboard that will
    // never see more than a few thousand reports.
    const snap = await db
      .collection("errorReports")
      .orderBy("createdAt", "desc")
      .limit(500)
      .get();

    const allItems = snap.docs.map((d) => ({ id: d.id, ...d.data() } as { id: string; status?: string; userId?: string | null; userPlan?: string }));

    let items = allItems;
    if (statusFilter && ALLOWED_STATUSES.includes(statusFilter as ReportStatus)) {
      items = allItems.filter((r) => (r.status ?? "open") === statusFilter);
    }
    items = items.slice(0, limit);

    // The customer category (Basic / Individual / Family / Schools) of each
    // reporter, from their user doc: the stored userPlan is the raw plan
    // field, and Family / Schools also store "deep". Best-effort; the client
    // falls back to the stored plan when this is missing.
    const uids = [...new Set(items.map((r) => r.userId).filter((u): u is string => !!u))];
    const catByUid: Record<string, CustomerCategory> = {};
    if (uids.length) {
      try {
        const docs = await db.getAll(...uids.map((u) => db.collection("users").doc(u)));
        for (const d of docs) if (d.exists) catByUid[d.id] = customerCategory(d.data() ?? {}, d.id);
      } catch {
        // rows still render with the stored plan
      }
    }
    const withCategory = items.map((r) => ({ ...r, userCategory: (r.userId && catByUid[r.userId]) || null }));

    // Counts per status from the same dataset
    const counts: Record<string, number> = { open: 0, reviewed: 0, fixed: 0, wontfix: 0, total: allItems.length };
    for (const r of allItems) {
      const s = r.status ?? "open";
      if (s in counts) counts[s]++;
    }

    return NextResponse.json({ items: withCategory, counts });
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
