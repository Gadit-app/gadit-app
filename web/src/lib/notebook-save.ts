import { getAdminDb } from "@/lib/firebase-admin";
import { FREE_NOTEBOOK_MAX } from "@/lib/plan-copy";
import { isNotAWordResult, isNotFoundMeaning } from "@/lib/not-a-word";

/**
 * Notebook writes shared by /api/notebook and the dictionary itself.
 *
 * Every word a signed-in person looks up is saved to their notebook
 * automatically, kids and adults alike (Gadi 2026-08-17, restated
 * 2026-10-22). The word page saves it from the browser too, but a child who
 * taps a word and goes back before the answer finishes left it unsaved
 * (about 1 in 10 real words that week), so /api/define now also saves the
 * finished result on the server.
 */

export function makeWordId(language: string, word: string): string {
  // Firestore doc IDs cannot contain "/", but we keep it simple and just
  // strip whitespace and lowercase. Two-language words don't collide because
  // we prefix with the language.
  const safe = `${language}_${word}`
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\p{L}\p{N}_]/gu, ""); // keep only letters/numbers/underscore from any script
  return safe.slice(0, 200) || "untitled";
}

type DefineResult = {
  word?: string;
  language?: string;
  suggestedWord?: string;
  meanings?: Array<{ meaning?: string; examples?: string[] }>;
};

/** Save a finished lookup once (never a typo the dictionary did not find). */
export async function saveLookupToNotebook(uid: string, plan: string, result: DefineResult): Promise<"saved" | "exists" | "skipped"> {
  const word = (result.word ?? "").trim();
  const language = (result.language ?? "").trim();
  const meaning = (result.meanings?.[0]?.meaning ?? "").trim();
  if (!word || !language || !meaning) return "skipped";
  if (isNotAWordResult(result) || isNotFoundMeaning(meaning)) return "skipped";
  const db = getAdminDb();
  const col = db.collection("users").doc(uid).collection("notebook");
  const ref = col.doc(makeWordId(language, word));
  if ((await ref.get()).exists) return "exists";
  if (plan !== "clear" && plan !== "deep") {
    const count = (await col.count().get()).data().count;
    if (count >= FREE_NOTEBOOK_MAX) return "skipped";
  }
  const now = new Date().toISOString();
  // create() fails when the browser's save won the race: then it exists.
  try {
    await ref.create({
      word,
      language,
      meaning: meaning.slice(0, 500),
      addedAt: now,
      nextReviewAt: now,
      intervalDays: 1,
      timesReviewed: 0,
      timesCorrect: 0,
    });
    return "saved";
  } catch {
    return "exists";
  }
}
