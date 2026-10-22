/**
 * The school word list (POST /api/learn action "list"), the parts with no
 * Firebase and no network: reading the pasted list, and the one small
 * translation prompt for the words the bank does not have. Pure, so a local
 * script can measure the prompt without calling the model (2026-10-22).
 */

/** Words of a pasted or photographed list: one per line, or separated by
 *  commas. "word - translation" keeps the parent's translation. */
export function parseList(text: string): Array<{ w: string; t?: string }> {
  const out: Array<{ w: string; t?: string }> = [];
  const seen = new Set<string>();
  for (const raw of text.split(/[\n\r,;•·\t]+/)) {
    const line = raw.replace(/^\s*[\d]+[.)]\s*/, "").trim();
    if (!line || line.length > 60) continue;
    const m = line.match(/^(.+?)\s*[-=:–]\s*(.+)$/);
    const w = (m ? m[1] : line).trim();
    const t = m ? m[2].trim() : undefined;
    const k = w.toLowerCase();
    if (!w || seen.has(k) || !/\p{L}/u.test(w)) continue;
    seen.add(k);
    out.push({ w, t });
    if (out.length >= 40) break;
  }
  return out;
}

/** The child's UI language, as the translation prompts name it (every UI
 *  language since learning English opened to all of them, 2026-10-18). */
export const LANG_NAME: Record<string, string> = {
  he: "Hebrew", ar: "Arabic", ru: "Russian", en: "English", es: "Spanish", pt: "Portuguese", fr: "French",
  de: "German", cs: "Czech", sk: "Slovak", it: "Italian", ja: "Japanese (kana first, as for a child)", hi: "Hindi",
  am: "Amharic", uk: "Ukrainian", tr: "Turkish", pl: "Polish", fa: "Persian (Farsi)", id: "Indonesian", nl: "Dutch",
  el: "Greek", zu: "isiZulu", xh: "isiXhosa", nso: "Sepedi (Northern Sotho)", tn: "Setswana", st: "Sesotho (Southern Sotho)",
  ts: "Xitsonga", ss: "siSwati", ve: "Tshivenda", nr: "South African isiNdebele", vi: "Vietnamese", fil: "Filipino",
  af: "Afrikaans", sw: "Swahili", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese (Taiwan)", ko: "Korean",
  th: "Thai", bn: "Bengali", da: "Danish", hu: "Hungarian",
};

/** The chat messages that translate the list words the bank lacks. */
export function listTranslateMessages(words: string[], lang: "en" | "he", ui: string): Array<{ role: "system" | "user"; content: string }> {
  const to = LANG_NAME[ui] ?? "English";
  const from = lang === "en" ? "English" : "Hebrew";
  return [
    { role: "system", content: `You translate a child's school vocabulary list (${from} words) into ${to}. For each word give the most common, child-appropriate translation, one word or a very short phrase, no explanations.${lang === "he" ? " Also give the Hebrew word with full, correct niqqud as \"nq\"." : ""} Reply as JSON: {"items":[{"w":"<word as given>","t":"<translation>"${lang === "he" ? ',"nq":"<word with niqqud>"' : ""}}]}.` },
    { role: "user", content: words.join("\n") },
  ];
}
