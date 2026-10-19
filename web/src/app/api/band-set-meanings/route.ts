import { NextRequest, NextResponse } from "next/server";
import { verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { bandSetMeanings } from "@/lib/band-meanings";

/**
 * GET /api/band-set-meanings?id=moe-band1-animals-1&lang=he   (Bearer optional)
 * → { defs: { word: meaning } }
 * The meaning of each word of a Ministry Band set that fits the set's topic,
 * for the projector (lib/band-meanings.ts, Gadi 2026-10-19). Cached ones for
 * anyone; a missing one is written on the spot for a signed-in user only
 * (one short call per set and language, then cached for everyone). Without
 * it the projector shows the dictionary's first meaning, as before.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

export async function GET(req: NextRequest) {
  const id = (req.nextUrl.searchParams.get("id") ?? "").trim();
  const lang = (req.nextUrl.searchParams.get("lang") ?? "").trim();
  const authHeader = req.headers.get("authorization") || "";
  const idToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : null;
  try {
    const user = idToken ? await verifyUserAndGetPlan(idToken) : null;
    const out = await bandSetMeanings(id, lang, { generate: !!user });
    return NextResponse.json({ defs: out?.defs ?? {} }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    console.error("[band-set-meanings]", id, lang, String(e).slice(0, 200));
    // The projector falls back to the dictionary's first meaning.
    return NextResponse.json({ defs: {} }, { status: 200 });
  }
}
