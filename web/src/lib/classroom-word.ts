import { getAdminDb } from "@/lib/firebase-admin";
import { curatedDef } from "@/lib/word-sets";

/**
 * Resolve the single "classroom meaning" for a set word — the exact
 * meaning the /word present view shows and keys its image + examples on.
 *
 * Present view (WordClient, classroomMode) uses:
 *   curatedDef(word) ?? result.meanings[0].meaning
 * where `result` came from /api/define in the set's language. So to warm
 * the EXACT cache key the projector will request, we mirror that:
 *   1. curated classroom definition, if we have one; else
 *   2. the first meaning of the already-cached /api/define result
 *      (read-only lookup of collection `cache`, no OpenAI spend).
 * Words with neither are returned as null so the caller can skip + report
 * (they still generate live on first projector view for a signed-in
 * teacher).
 */

export type ResolvedMeaning = {
  meaning: string;
  example: string;
  source: "curated" | "cache";
};

/** First meaning + example from the base-tier define cache, if present. */
export async function cachedDefineFirstMeaning(
  word: string,
  lang: string,
): Promise<{ meaning: string; example: string } | null> {
  const key = `auto2_${lang}_base_${word.trim().toLowerCase()}`;
  const snap = await getAdminDb().collection("cache").doc(key).get();
  if (!snap.exists) return null;
  const data = snap.data() as
    | { meanings?: Array<{ meaning?: string; examples?: string[] }> }
    | undefined;
  const meanings = Array.isArray(data?.meanings) ? data!.meanings : [];
  const meaning = typeof meanings[0]?.meaning === "string" ? meanings[0]!.meaning : "";
  const example =
    Array.isArray(meanings[0]?.examples) && typeof meanings[0]!.examples![0] === "string"
      ? meanings[0]!.examples![0]
      : "";
  if (!meaning) return null;
  return { meaning, example };
}

export async function resolveClassroomMeaning(
  word: string,
  lang: string,
): Promise<ResolvedMeaning | null> {
  const cd = curatedDef(word);
  if (cd) return { meaning: cd, example: "", source: "curated" };
  const cached = await cachedDefineFirstMeaning(word, lang);
  if (cached) return { meaning: cached.meaning, example: cached.example, source: "cache" };
  return null;
}
