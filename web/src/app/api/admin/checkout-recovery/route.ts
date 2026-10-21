import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { collectAbandoned, openCheckouts, recoveryEnabled } from "@/lib/checkout-recovery";

/**
 * GET /api/admin/checkout-recovery?secret=ADMIN_SECRET: open abandoned
 * checkouts ("התחילו ולא סיימו") for the Revenue page, live from Stripe,
 * with which recovery emails each one got. Read only.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || !process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const db = getAdminDb();
    const [{ candidates }, enabled] = await Promise.all([
      collectAbandoned(stripe, db, getAdminAuth()),
      recoveryEnabled(db),
    ]);
    const rows = openCheckouts(candidates).map((c) => ({
      subId: c.subId,
      customerId: c.customerId,
      uid: c.uid,
      name: c.name,
      email: c.email,
      phone: c.phone,
      plan: c.plan,
      priceId: c.priceId,
      lang: c.lang,
      createdAt: new Date(c.createdMs).toISOString(),
      ageHours: c.ageHours,
      internal: c.internal,
      blocked: c.exclusion, // internal / no_email / unsubscribed / suppressed: open, never emailed
      e1At: c.ledger?.e1At ?? null,
      e2At: c.ledger?.e2At ?? null,
      e3At: c.ledger?.e3At ?? null,
      nextStep: c.due,
    }));
    return NextResponse.json({ generatedAt: new Date().toISOString(), enabled, count: rows.filter((r) => !r.internal).length, rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
