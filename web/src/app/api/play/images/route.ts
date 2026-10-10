/**
 * POST /api/play/images  { words: string[] }  →  { images: { [word]: url } }
 *
 * Pictures for the flash cards (Gadi 2026-10-10: every card shows its
 * picture with the word, before it is flipped). Read-only: it only looks
 * the words up in the shared `imageCache` and never generates, so it costs
 * nothing. A word with several cached pictures gets the newest house style
 * first: the soft-3D classroom kids pictures, then kids, then the rest.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_WORDS = 60;

function rank(docId: string): number {
  if (docId.startsWith("img_cls2_kids_")) return 0;
  if (docId.startsWith("img_cls")) return 1;
  if (docId.startsWith("img_kids_")) return 2;
  return 3;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const idToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : null;
  const user = await verifyUserAndGetPlan(idToken);
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });

  let words: string[] = [];
  try {
    const b = (await req.json()) as { words?: unknown };
    if (Array.isArray(b.words)) {
      words = [...new Set(b.words.filter((w): w is string => typeof w === "string").map((w) => w.trim()).filter((w) => w && w.length <= 80))].slice(0, MAX_WORDS);
    }
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (words.length === 0) return NextResponse.json({ images: {} });

  // The cache stores the word as it was looked up; ask for it as given and
  // lowercased, then answer under the caller's spelling.
  const variants = [...new Set(words.flatMap((w) => [w, w.toLowerCase()]))];
  const best = new Map<string, { url: string; r: number }>();
  const db = getAdminDb();
  try {
    for (let i = 0; i < variants.length; i += 30) {
      const snap = await db.collection("imageCache").where("word", "in", variants.slice(i, i + 30)).get();
      for (const d of snap.docs) {
        const x = d.data() as { word?: string; url?: string };
        if (!x.url || !x.word) continue;
        const k = x.word.trim().toLowerCase();
        const r = rank(d.id);
        const cur = best.get(k);
        if (!cur || r < cur.r) best.set(k, { url: x.url, r });
      }
    }
  } catch (e) {
    console.error("[play/images]", e);
  }
  const images: Record<string, string> = {};
  for (const w of words) {
    const hit = best.get(w.toLowerCase());
    if (hit) images[w] = hit.url;
  }
  return NextResponse.json({ images });
}
