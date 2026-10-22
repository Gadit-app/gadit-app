/**
 * POST /api/play/images  { words: string[] }  →  { images: { [word]: url } }
 *
 * Pictures for the flash cards (Gadi 2026-10-10: every card shows its
 * picture with the word, before it is flipped). Read-only: it only looks
 * the words up in the shared `imageCache` and never generates, so it costs
 * nothing. A word with several cached pictures gets the newest house style
 * first: the soft-3D classroom kids pictures, then kids, then the rest.
 *
 * With { generate: true } (the flash cards, 2026-10-22: a mother saw many
 * cards with no picture), up to 12 English words with no picture yet are
 * drawn after the answer, in the house style (lib/classroom-image pickImage,
 * ~0.65 cents each), at most 40 a day per person; the next deck has them.
 */
import { NextRequest, NextResponse, after } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { pickImage } from "@/lib/classroom-image";

const GEN_PER_CALL = 12;
const GEN_PER_DAY = 40;
const ENGLISH_WORD = /^[a-z][a-z' -]{1,28}[a-z]$/i;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_WORDS = 60;

function rank(docId: string): number {
  if (docId.startsWith("img_cls2_kids_")) return 0;
  // The Homework picture game's kids pictures are the same house style.
  if (docId.startsWith("img_cls") || docId.startsWith("img_pick_kids_")) return 1;
  if (docId.startsWith("img_kids_")) return 2;
  return 3;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const idToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : null;
  const user = await verifyUserAndGetPlan(idToken);
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });

  let words: string[] = [];
  let generate = false;
  const hints: Record<string, string> = {};
  try {
    const b = (await req.json()) as { words?: unknown; generate?: unknown; hints?: unknown };
    generate = b.generate === true;
    if (b.hints && typeof b.hints === "object") for (const [k, v] of Object.entries(b.hints as Record<string, unknown>)) if (typeof v === "string") hints[k] = v;
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
  // Draw the missing English pictures after answering (never for anonymous).
  if (generate) {
    const missing = [...new Set(words.filter((w) => !images[w] && ENGLISH_WORD.test(w)).map((w) => w.trim()))].slice(0, GEN_PER_CALL);
    if (missing.length) {
      after(async () => {
        const ref = db.collection("users").doc(user.userId);
        const day = new Date().toISOString().slice(0, 10);
        const cur = ((await ref.get()).get("flashPicGen") as { day?: string; n?: number } | undefined) ?? {};
        let used = cur.day === day ? cur.n ?? 0 : 0;
        const todo = missing.slice(0, Math.max(0, GEN_PER_DAY - used));
        for (let i = 0; i < todo.length; i += 3) {
          const res = await Promise.all(todo.slice(i, i + 3).map((w) => pickImage(w, "everyday words", { hint: hints[w] }).catch(() => null)));
          used += res.filter((r) => r?.status === "generated").length;
        }
        await ref.set({ flashPicGen: { day, n: used } }, { merge: true });
      });
    }
  }
  return NextResponse.json({ images });
}
