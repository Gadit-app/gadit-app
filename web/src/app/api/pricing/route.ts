import { NextRequest, NextResponse } from "next/server";
import { displayForCountry } from "@/lib/pricing-currency";

/**
 * Returns the fixed price block for the caller's country (Vercel edge geo
 * header), so the pricing page displays the SAME currency + amounts that
 * checkout will pin. usd-only today; adding a market is pure data (see
 * lib/pricing-currency.ts). Never cached — it varies by country.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(req: NextRequest) {
  const country = req.headers.get("x-vercel-ip-country");
  return NextResponse.json(displayForCountry(country));
}
