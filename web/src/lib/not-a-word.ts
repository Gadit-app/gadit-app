/**
 * The dictionary's "not a word" answers (api/define RULE 1b / 1c): one
 * meaning that says the word was not found (often "did you mean X?") and no
 * examples. Such a lookup must never land in the notebook, or the games
 * offer the typo as a word (Gadi 2026-10-20: "טיפד" showed up as an answer
 * in fill-in-the-sentence for a family that had mistyped "טיפש").
 */

const NOT_FOUND_RX = /לא נמצאה במילון|אולי התכוונת|not found in the dictionary|was not found|did you mean|غير موجودة في القاموس|هل تقصد|не найдено в словаре|возможно, вы имели в виду/i;

/** True for a saved meaning text that is the not-found fallback. */
export function isNotFoundMeaning(meaning: string | null | undefined): boolean {
  return !!meaning && NOT_FOUND_RX.test(meaning);
}

/** True for a whole define result that is the not-found fallback: a
 *  suggested spelling, or a single meaning with no examples at all. */
export function isNotAWordResult(r: { suggestedWord?: string; meanings?: Array<{ meaning?: string; examples?: string[] }> } | null | undefined): boolean {
  if (!r) return false;
  if (r.suggestedWord) return true;
  const ms = r.meanings ?? [];
  if (ms.length !== 1) return false;
  const noExamples = !(ms[0].examples ?? []).some((e) => (e ?? "").trim());
  return noExamples && isNotFoundMeaning(ms[0].meaning);
}
