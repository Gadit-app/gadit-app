import { getAdminDb } from "@/lib/firebase-admin";
import { logAiUsage, costWithCache, TEXT_MODEL_FAST } from "@/lib/ai-cost";
import { bandSetOf } from "@/lib/band-sets";
import { isKnownUiLang, uiLangName } from "@/lib/word-examples";

/**
 * "The meaning for this topic" of the Ministry's English Band sets on the
 * teacher's projector (Gadi 2026-10-19). These sets have no hand-written
 * definitions, so the projector showed the dictionary's FIRST meaning,
 * which can be wrong for the topic ("fly" in Animals is the insect, not the
 * verb; "bat" in Animals is the animal).
 *
 * On a set's first Present, ONE short call writes, for every word of the
 * set at once, the meaning that fits the set's topic, in the teacher's UI
 * language. Kept in Firestore bandSetMeanings/{setId}_{uiLang}, so each set
 * is paid once per language. Never made in bulk: only when a set is shown.
 * The projector then shows that meaning, and its picture, examples and
 * class activity are made for it (classroomDef, lib/word-sets.ts).
 */

export const BAND_MEANINGS_VERSION = 1;
const COLLECTION = "bandSetMeanings";

export type BandMeanings = {
  defs: Record<string, string>;
  cached: boolean;
  /** Measured on a new call (token usage at list prices). */
  costUsd?: number;
  tokensIn?: number;
  tokensOut?: number;
  cachedIn?: number;
};

const docId = (setId: string, uiLang: string) => `${setId}_${uiLang}`;
// One call at a time per set and language on this server instance (the
// projector page can ask twice while it loads).
const inflight = new Map<string, Promise<BandMeanings | null>>();

/** A set's meanings for its topic: from the cache, or written now when
 *  `generate` (a signed-in teacher). null when there are none and none may
 *  be made, or the set or the language is unknown. */
export async function bandSetMeanings(setId: string, uiLang: string, opts: { generate: boolean }): Promise<BandMeanings | null> {
  const band = bandSetOf(setId);
  if (!band || !isKnownUiLang(uiLang)) return null;
  const ref = getAdminDb().collection(COLLECTION).doc(docId(setId, uiLang));
  const snap = await ref.get();
  const have = snap.data() as { defs?: Record<string, string>; version?: number } | undefined;
  if (have?.defs && have.version === BAND_MEANINGS_VERSION) return { defs: have.defs, cached: true };
  if (!opts.generate) return null;
  const k = docId(setId, uiLang);
  const running = inflight.get(k);
  if (running) return running;
  const job = (async () => {
    const out = await writeMeanings(band.words, band.topic, band.band, uiLang);
    await ref.set({
      setId, uiLang, topic: band.topic, words: band.words, defs: out.defs, version: BAND_MEANINGS_VERSION,
      model: TEXT_MODEL_FAST, tokensIn: out.tokensIn, tokensOut: out.tokensOut, cachedIn: out.cachedIn, costUsd: out.costUsd,
      createdAt: new Date().toISOString(),
    });
    return out;
  })().finally(() => inflight.delete(k));
  inflight.set(k, job);
  return job;
}

// Our own copy never uses long dashes (they read as machine-written).
// Each definition ends as a sentence, like the hand-written ones.
const clean = (s: string) => {
  const t = s.replace(/\s*[–—]\s*/g, ", ").replace(/\s+/g, " ").trim().slice(0, 220);
  return t && !/[.!?。؟]$/.test(t) ? `${t}.` : t;
};

async function writeMeanings(words: string[], topic: string, band: "band1" | "band2", uiLang: string): Promise<BandMeanings> {
  const langName = uiLangName(uiLang);
  const who = band === "band1" ? "elementary school children (ages 7 to 11)" : "middle school students (ages 12 to 15)";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: TEXT_MODEL_FAST,
      temperature: 0.2,
      max_completion_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write the one classroom meaning of each English word in a school word list shown on the teacher's projector. " +
            "The list has a topic, and each word is taught in the meaning that fits that topic (in a list about animals, " +
            "\"fly\" is the small insect, not the verb to fly; \"bat\" is the animal, not the stick). When a word has no " +
            "meaning in the topic, give its most common everyday meaning.",
        },
        {
          role: "user",
          content:
            `Topic: "${topic}". Students: ${who} learning English.\n` +
            `Words: ${JSON.stringify(words)}\n\n` +
            `For each word, write its meaning in this topic in ${langName}: one short, simple definition (5 to 14 words) ` +
            `that ${who} understand, without using the English word itself, with no dashes. ` +
            `Reply as JSON: {"defs": {"<word exactly as given>": "<definition in ${langName}>"}} with every word.`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`openai_${res.status}`);
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; prompt_tokens_details?: { cached_tokens?: number } };
  };
  const tokensIn = data.usage?.prompt_tokens ?? 0;
  const tokensOut = data.usage?.completion_tokens ?? 0;
  const cachedIn = data.usage?.prompt_tokens_details?.cached_tokens ?? 0;
  const costUsd = costWithCache(TEXT_MODEL_FAST, tokensIn, cachedIn, tokensOut);
  void logAiUsage({ feature: "band_meanings", model: TEXT_MODEL_FAST, tokensIn, tokensOut, costUsd });
  let raw: Record<string, unknown> = {};
  try {
    const j = JSON.parse(String(data.choices?.[0]?.message?.content ?? "{}")) as { defs?: Record<string, unknown> };
    raw = j.defs && typeof j.defs === "object" ? j.defs : {};
  } catch { /* checked below */ }
  const byKey = new Map(Object.entries(raw).map(([w, d]) => [w.trim().toLowerCase(), d]));
  const defs: Record<string, string> = {};
  for (const w of words) {
    const d = byKey.get(w.trim().toLowerCase());
    if (typeof d === "string" && clean(d)) defs[w] = clean(d);
  }
  // Most of the set or nothing: a half-answered list is not kept.
  if (Object.keys(defs).length < Math.ceil(words.length * 0.7)) throw new Error("too_few_meanings");
  return { defs, cached: false, costUsd, tokensIn, tokensOut, cachedIn };
}
