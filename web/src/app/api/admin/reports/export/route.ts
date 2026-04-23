import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Token-protected export endpoint for AI-assisted review.
 *
 * Usage:
 *   GET /api/admin/reports/export?token=XYZ&status=open&limit=20
 *
 * Returns a flattened, AI-readable JSON of recent reports — including the
 * GPT context snapshot. Designed so an AI assistant can fetch the URL
 * directly via WebFetch without going through the browser auth flow.
 *
 * Security model:
 * - The token is set in env (ADMIN_EXPORT_TOKEN) and known only to the admin.
 * - Anyone with the token can read reports — there is no per-user check.
 *   So treat the token like a password: if it leaks, rotate it.
 * - To rotate: change ADMIN_EXPORT_TOKEN in Vercel env.
 */

const ALLOWED_STATUSES = ["open", "reviewed", "fixed", "wontfix"] as const;
type ReportStatus = (typeof ALLOWED_STATUSES)[number];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const expected = process.env.ADMIN_EXPORT_TOKEN;

  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_EXPORT_TOKEN env var not set" },
      { status: 500 }
    );
  }
  if (!token || token !== expected) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  try {
    const statusFilter = url.searchParams.get("status");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);

    const db = getAdminDb();
    const snap = await db
      .collection("errorReports")
      .orderBy("createdAt", "desc")
      .limit(500)
      .get();

    const allItems = snap.docs.map((d) => {
      const data = d.data();
      // Try to parse contextSnapshot back into JSON (it was stringified on POST).
      let parsedContext: unknown = data.contextSnapshot;
      if (typeof data.contextSnapshot === "string") {
        try {
          parsedContext = JSON.parse(data.contextSnapshot);
        } catch {
          /* keep as string */
        }
      }
      return {
        id: d.id,
        createdAt: data.createdAt,
        status: data.status ?? "open",
        word: data.word,
        uiLang: data.uiLang,
        categories: data.categories,
        details: data.details,
        userEmail: data.userEmail,
        userPlan: data.userPlan,
        pageUrl: data.pageUrl,
        adminNote: data.adminNote,
        // Include the full GPT response so the AI can see exactly what was wrong
        gptResponse: parsedContext,
      };
    });

    let items = allItems;
    if (statusFilter && ALLOWED_STATUSES.includes(statusFilter as ReportStatus)) {
      items = allItems.filter((r) => r.status === statusFilter);
    }
    items = items.slice(0, limit);

    const counts: Record<string, number> = {
      open: 0,
      reviewed: 0,
      fixed: 0,
      wontfix: 0,
      total: allItems.length,
    };
    for (const r of allItems) {
      if (r.status in counts) counts[r.status]++;
    }

    return NextResponse.json(
      {
        counts,
        returned: items.length,
        items,
      },
      {
        headers: {
          // Don't cache — admin needs fresh data
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    console.error("admin export error:", err);
    return NextResponse.json(
      { error: "internal_error", details: String(err) },
      { status: 500 }
    );
  }
}
