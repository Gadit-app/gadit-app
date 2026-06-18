import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "./firebase-admin";

/**
 * Record one word-search event into the `wordSearches` collection so
 * the /admin/searches dashboard can show top queries per language.
 *
 * Doc ID: `<uiLang>_<word>` — deterministic so concurrent searches for
 * the same word atomically share one counter (no read-modify-write).
 * Slashes are stripped because Firestore doc IDs can't contain them;
 * words are truncated to 100 chars to keep doc IDs bounded.
 *
 * Fire-and-forget — caller awaits nothing. Errors are logged and
 * swallowed so analytics writes never block the response a user is
 * waiting for.
 *
 * Counted on EVERY /api/define hit, both cache hits and live OpenAI
 * generations. Easter-egg "gadit" lookups and 400-invalid inputs are
 * intentionally NOT counted (this fires after those early returns).
 */
export async function recordWordSearch(opts: {
  word: string;
  lang: string;
}): Promise<void> {
  try {
    const word = opts.word.toLowerCase().trim();
    if (!word) return;
    const safeWord = word.slice(0, 100).replace(/[\/\.]/g, "_");
    const docId = `${opts.lang}_${safeWord}`;
    await getAdminDb()
      .collection("wordSearches")
      .doc(docId)
      .set(
        {
          word,
          lang: opts.lang,
          count: FieldValue.increment(1),
          lastAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
  } catch (e) {
    console.warn("[recordWordSearch] failed:", String(e));
  }
}
