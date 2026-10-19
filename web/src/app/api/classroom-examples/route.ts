import { NextRequest, NextResponse } from "next/server";
import { classroomDef, classroomMeaning } from "@/lib/word-sets";
import { loadWordSet } from "@/lib/curriculum-sets";
import { getOrGenerateExamples } from "@/lib/word-examples";
import { isPilotTopicId } from "@/lib/pilot-topics";
import { pilotGate } from "@/lib/pilot-access";
import { getAdminDb } from "@/lib/firebase-admin";
import { itemExampleKey } from "@/lib/classroom-keys";
import { isSchoolSetId } from "@/lib/school-set-ids";
import { isBandSetId } from "@/lib/band-sets";

/** A Gemara quote stored with a meaning (exampleCache ex_m_ doc, `quote`),
 *  returned only when the record says the expert approved and verified it. */
type ClassroomQuote = { text: string; tractate: string; daf: string; amud: string };
function approvedQuote(q: unknown): ClassroomQuote | undefined {
  const o = q as Record<string, unknown> | null;
  if (!o || o.approved !== true || !o.approvedBy || !o.verifiedAgainst) return undefined;
  const s = (k: string) => (typeof o[k] === "string" ? (o[k] as string).trim() : "");
  const out = { text: s("text"), tractate: s("tractate"), daf: s("daf"), amud: s("amud") };
  return out.text && out.tractate && out.daf && out.amud ? out : undefined;
}

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
  // A school's own set for middle and high school: sentences for teenagers.
  let audience: "teen" | undefined;

  if (params.setId) {
    const set = await loadWordSet(params.setId);
    if (set && !uiLang) uiLang = set.lang;
    if (set && isSchoolSetId(set.id) && set.level === "secondary") audience = "teen";
    // The Ministry's English Band II list is middle school too.
    if (set && isBandSetId(set.id) && set.level === "middle") audience = "teen";
    // A meaning of a unit that lists meanings: its own definition and key, and
    // approved (imported) examples only, in every unit (phase C).
    const item = classroomMeaning(params.setId, params.m);
    if (item) {
      const res = await getOrGenerateExamples(item.w, item.d, uiLang || "he", { item: { m: item.m, rev: item.rev }, variant: item.lv, generate: false });
      let quote: ClassroomQuote | undefined;
      try {
        const doc = await getAdminDb().collection("exampleCache").doc(itemExampleKey({ m: item.m, rev: item.rev }, uiLang || "he", item.lv)).get();
        quote = approvedQuote(doc.get("quote"));
      } catch { /* no quote */ }
      return { examples: res.examples, cached: res.cached, ...(quote ? { quote } : {}), status: 200 as const };
    }
  }
  if (!meaning) meaning = classroomDef(params.setId, word) ?? "";
  if (!uiLang) uiLang = "he";

  if (!meaning) {
    // No curated def and no explicit meaning — nothing to pin examples
    // to. Return empty so the caller falls back to the define examples.
    return { examples: [], cached: false, status: 200 as const };
  }

  const res = await getOrGenerateExamples(word, meaning, uiLang, { generate: !isPilotTopicId(params.setId), audience });
  return { examples: res.examples, cached: res.cached, status: 200 as const };
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  // A pilot unit: a signed-in user of an allowed school only (other units: no change).
  const gate = await pilotGate(req, sp.get("set"));
  if (gate) return gate;
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
  const o = out as { examples?: string[]; cached?: boolean; quote?: ClassroomQuote };
  return NextResponse.json({ examples: o.examples ?? [], cached: o.cached ?? false, ...(o.quote ? { quote: o.quote } : {}) });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    word?: string;
    meaning?: string;
    set?: string;
    uiLang?: string;
    m?: string;
  };
  const gate = await pilotGate(req, body.set);
  if (gate) return gate;
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
  const o = out as { examples?: string[]; cached?: boolean };
  return NextResponse.json({ examples: o.examples ?? [], cached: o.cached ?? false });
}
