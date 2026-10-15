import { NextRequest, NextResponse } from "next/server";
import { classroomDef, classroomItem } from "@/lib/word-sets";
import { loadWordSet } from "@/lib/curriculum-sets";
import { getOrGenerateExamples } from "@/lib/word-examples";
import { isPilotTopicId } from "@/lib/pilot-topics";

/**
 * Subject-appropriate example sentences for classroom / present mode.
 *
 * The classroom present view calls this to get 3 examples pinned to the
 * word's curated (subject-relevant) meaning, instead of the general
 * /api/define examples which drift to another sense. Cheap: cached in
 * Firestore exampleCache/<key>, one gpt-4o-mini call per unique
 * (word, meaning). These are curriculum words, so generating is open
 * (no user auth) — the classroom projector is not always signed in.
 *
 * USAGE:
 *   GET  /api/classroom-examples?word=<w>&set=<setId>
 *   GET  /api/classroom-examples?word=<w>&meaning=<m>&uiLang=he
 *   &m=<meaning id> in a unit that lists meanings (Gemara phase A)
 *   POST { word, set?|meaning?, uiLang? }
 * Returns { examples: string[], cached: boolean }.
 */
export const maxDuration = 30;

async function resolve(params: {
  word?: string | null;
  meaning?: string | null;
  setId?: string | null;
  uiLang?: string | null;
  m?: string | null;
}) {
  const word = (params.word ?? "").trim();
  if (!word) return { error: "word required", status: 400 as const };

  // Resolve the meaning + language. Priority: explicit meaning, else the
  // curated classroom definition (optionally via the set's language).
  let meaning = (params.meaning ?? "").trim();
  let uiLang = (params.uiLang ?? "").trim();

  if (params.setId) {
    const set = await loadWordSet(params.setId);
    if (set && !uiLang) uiLang = set.lang;
    // A meaning of a unit that lists meanings: its own definition and key.
    const item = classroomItem(params.setId, params.m);
    if (item) {
      // A pilot unit serves approved (imported) examples only, never generates.
      const res = await getOrGenerateExamples(item.w, item.d, uiLang || "he", { item: { m: item.m, rev: item.rev }, generate: !isPilotTopicId(params.setId) });
      return { examples: res.examples, cached: res.cached, status: 200 as const };
    }
  }
  if (!meaning) meaning = classroomDef(params.setId, word) ?? "";
  if (!uiLang) uiLang = "he";

  if (!meaning) {
    // No curated def and no explicit meaning — nothing to pin examples
    // to. Return empty so the caller falls back to the define examples.
    return { examples: [], cached: false, status: 200 as const };
  }

  const res = await getOrGenerateExamples(word, meaning, uiLang, { generate: !isPilotTopicId(params.setId) });
  return { examples: res.examples, cached: res.cached, status: 200 as const };
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const out = await resolve({
    word: sp.get("word"),
    meaning: sp.get("meaning"),
    setId: sp.get("set"),
    uiLang: sp.get("uiLang"),
    m: sp.get("m"),
  });
  if ("error" in out && out.error) {
    return NextResponse.json({ error: out.error }, { status: out.status });
  }
  return NextResponse.json({ examples: out.examples ?? [], cached: out.cached ?? false });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    word?: string;
    meaning?: string;
    set?: string;
    uiLang?: string;
    m?: string;
  };
  const out = await resolve({
    word: body.word,
    meaning: body.meaning,
    setId: body.set,
    uiLang: body.uiLang,
    m: body.m,
  });
  if ("error" in out && out.error) {
    return NextResponse.json({ error: out.error }, { status: out.status });
  }
  return NextResponse.json({ examples: out.examples ?? [], cached: out.cached ?? false });
}
