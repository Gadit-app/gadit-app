import { NextRequest, NextResponse } from "next/server";
import { WORD_SETS, getWordSet } from "@/lib/word-sets";
import { resolveClassroomMeaning } from "@/lib/classroom-word";
import { generateWordImage } from "@/lib/word-image";
import { getOrGenerateExamples } from "@/lib/word-examples";

/**
 * Admin: batch-warm a classroom word set (or every set). For each word:
 *   - resolve the classroom meaning (curated def, else cached define
 *     first-meaning) — the EXACT meaning the projector shows;
 *   - generate + cache the IMAGE (non-kids img_<lang>_* key, which is
 *     what the projector requests) if not already cached;
 *   - generate + cache subject-appropriate EXAMPLES.
 * This removes the need to manually walk a set in present mode.
 *
 * Images warmed here write the SAME imageCache/<cacheKey> docs (same key
 * formula) the live /api/generate-image route writes, so the classroom
 * finds them on a cache hit. The live route itself is untouched.
 *
 * USAGE:
 *   GET /api/admin/warm-set?secret=$ADMIN_SECRET&set=<setId|all>
 *        [&offset=0][&limit=6][&force=1]
 * Because gpt-image-1 is slow (~5-15s each) the endpoint processes a
 * capped batch within a time budget and reports { capped, nextOffset }
 * so a caller (or the /admin/sets button) can continue where it left off.
 */
export const maxDuration = 60;

// Non-kids projector key: WordClient's classroom auto-generate sends the
// live kidsMode value, but per the schools guardrail the projector warms
// the adult img_<lang>_* namespace.
const KIDS_MODE = false;
// Soft wall-clock budget; leave headroom under maxDuration=60 for the
// final response + a straggler image call already in flight.
const TIME_BUDGET_MS = 48_000;
const DEFAULT_LIMIT = 6;

type WordTarget = { word: string; lang: string; setId: string };

function buildTargets(setId: string): WordTarget[] | null {
  if (setId === "all") {
    const seen = new Set<string>();
    const out: WordTarget[] = [];
    for (const s of WORD_SETS) {
      for (const w of s.words) {
        const k = `${s.lang}|${w.trim().toLowerCase()}`;
        if (seen.has(k)) continue;
        seen.add(k);
        out.push({ word: w, lang: s.lang, setId: s.id });
      }
    }
    return out;
  }
  const set = getWordSet(setId);
  if (!set) return null;
  return set.words.map((w) => ({ word: w, lang: set.lang, setId: set.id }));
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const secret = sp.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const setId = sp.get("set") ?? "all";
  const targets = buildTargets(setId);
  if (!targets) return NextResponse.json({ error: "set_not_found", setId }, { status: 404 });

  const offset = Math.max(0, parseInt(sp.get("offset") ?? "0", 10) || 0);
  const limit = Math.max(1, Math.min(20, parseInt(sp.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));
  const force = sp.get("force") === "1";

  const started = Date.now();
  const results: Array<{
    word: string;
    lang: string;
    image: "cached" | "generated" | "skipped" | "error";
    examples: number;
    meaningSource?: "curated" | "cache";
    error?: string;
  }> = [];

  let processed = 0;
  let i = offset;
  for (; i < targets.length && processed < limit; i++) {
    if (Date.now() - started > TIME_BUDGET_MS) break;
    const { word, lang } = targets[i];
    processed++;

    const resolved = await resolveClassroomMeaning(word, lang);
    if (!resolved) {
      // No curated def and no cached define result — nothing to key the
      // image/examples on. It still generates live on first projector
      // view for a signed-in teacher.
      results.push({ word, lang, image: "skipped", examples: 0 });
      continue;
    }

    // Image
    let image: "cached" | "generated" | "error" = "error";
    let imgError: string | undefined;
    try {
      const img = await generateWordImage({
        word,
        meaning: resolved.meaning,
        example: resolved.example,
        uiLang: lang,
        kidsMode: KIDS_MODE,
        force,
      });
      if (img.status === "cached") image = "cached";
      else if (img.status === "generated") image = "generated";
      else { image = "error"; imgError = img.error; }
    } catch (e) {
      imgError = String(e).slice(0, 200);
    }

    // Examples
    let exCount = 0;
    try {
      const ex = await getOrGenerateExamples(word, resolved.meaning, lang, { force });
      exCount = ex.examples.length;
    } catch {
      /* examples best-effort */
    }

    results.push({
      word,
      lang,
      image,
      examples: exCount,
      meaningSource: resolved.source,
      ...(imgError ? { error: imgError } : {}),
    });
  }

  const nextOffset = i;
  const capped = nextOffset < targets.length;

  return NextResponse.json({
    ok: true,
    set: setId,
    total: targets.length,
    offset,
    processed: results.length,
    nextOffset: capped ? nextOffset : null,
    capped,
    elapsedMs: Date.now() - started,
    results,
  });
}
