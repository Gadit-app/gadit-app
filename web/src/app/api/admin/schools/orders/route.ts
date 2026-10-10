import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Admin: pilot and quote requests from schools (the `schoolOrders`
 * collection, written by /api/schools/order).
 *
 *   GET  /api/admin/schools/orders?secret=$ADMIN_SECRET
 *        → { orders: [...] } newest first, every stored field.
 *   POST /api/admin/schools/orders?secret=$ADMIN_SECRET  { id, status }
 *        → sets status to new | contacted | pilot_opened | closed.
 *
 * Orders written before this view carry status "pending"; it reads as "new".
 * Auth: ADMIN_SECRET via ?secret= (same as the sibling admin routes).
 */

export const dynamic = "force-dynamic";

const STATUSES = new Set(["new", "contacted", "pilot_opened", "closed"]);

function authorized(req: NextRequest): NextResponse | null {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return null;
}

function iso(v: unknown): string | null {
  if (typeof v === "string") return v;
  const t = v as { toDate?: () => Date } | null;
  return t?.toDate ? t.toDate().toISOString() : null;
}

export async function GET(req: NextRequest) {
  const denied = authorized(req);
  if (denied) return denied;

  // Small collection: read it whole and sort here, so a doc without
  // createdAt still shows (at the bottom).
  const snap = await getAdminDb().collection("schoolOrders").get();
  const orders = snap.docs.map((d) => {
    const x = d.data() as Record<string, unknown>;
    const status = typeof x.status === "string" && STATUSES.has(x.status) ? x.status : "new";
    return {
      id: d.id,
      schoolName: (x.schoolName as string) ?? "",
      contactName: (x.contactName as string) ?? "",
      role: (x.role as string | null) ?? null,
      email: (x.email as string) ?? "",
      phone: (x.phone as string | null) ?? null,
      city: (x.city as string | null) ?? null,
      size: (x.size as string | null) ?? null,
      sizeLabel: (x.sizeLabel as string | null) ?? null,
      grade: (x.grade as string | null) ?? null,
      schoolType: (x.schoolType as string | null) ?? null,
      notes: (x.notes as string | null) ?? null,
      lang: (x.lang as string) ?? "",
      kind: x.kind === "order" ? "order" : "pilot",
      status,
      statusAt: iso(x.statusAt),
      createdAt: iso(x.createdAt),
    };
  });
  orders.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return NextResponse.json({ orders, total: orders.length });
}

export async function POST(req: NextRequest) {
  const denied = authorized(req);
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as { id?: unknown; status?: unknown };
  const id = typeof body.id === "string" ? body.id.trim() : "";
  const status = typeof body.status === "string" ? body.status : "";
  if (!id || !STATUSES.has(status)) return NextResponse.json({ error: "bad_body" }, { status: 400 });

  const ref = getAdminDb().collection("schoolOrders").doc(id);
  if (!(await ref.get()).exists) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const statusAt = new Date().toISOString();
  await ref.set({ status, statusAt }, { merge: true });
  return NextResponse.json({ ok: true, id, status, statusAt });
}
