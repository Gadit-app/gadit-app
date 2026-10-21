/**
 * The reading check's prompt and model request (/api/reading-check), kept
 * free of imports so a plain Node script can run the exact same call for a
 * quality and cost sample.
 */

export const LANG_NAME: Record<string, string> = {
  en: "English", he: "Hebrew", ar: "Arabic", ru: "Russian", es: "Spanish",
  pt: "Portuguese", fr: "French", de: "German", cs: "Czech", sk: "Slovak",
  it: "Italian", ja: "Japanese", hi: "Hindi", am: "Amharic", uk: "Ukrainian",
  tr: "Turkish", pl: "Polish", fa: "Persian", id: "Indonesian", nl: "Dutch",
  el: "Greek", zu: "Zulu", vi: "Vietnamese", fil: "Filipino", af: "Afrikaans",
  sw: "Swahili", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese",
  ko: "Korean", th: "Thai", bn: "Bengali", da: "Danish", hu: "Hungarian", xh: "Xhosa (isiXhosa)", nso: "Northern Sotho (Sepedi)", tn: "Tswana (Setswana)", st: "Southern Sotho (Sesotho)", ts: "Tsonga (Xitsonga)", ss: "Swati (siSwati)", ve: "Venda (Tshivenda)", nr: "South Ndebele (isiNdebele)",
};

/** No em or en dashes in anything the model writes (they read as AI). */
export function noDashes(s: string): string {
  return s
    .replace(/(\d)\s*[–—]\s*(\d)/g, "$1-$2")
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/,\s*,/g, ",")
    .replace(/^\s*,\s*/, "")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();
}

export function buildPrompt(langName: string, kids: boolean, lang: string): string {
  const audience = kids
    ? `The reader is a CHILD (about 7 to 11) who read the text alone. Every question, option and explanation uses very simple, short, everyday words a child knows. Short sentences. Nothing scary or grown-up.`
    : `The reader may be an older student or an adult learner. Use clear, plain, short language.`;
  const hebrew = lang === "he"
    ? `\n- Hebrew: address the reader in the PLURAL (בחרו, קראו, חשבו), never in the singular masculine or feminine. Write the options and explanations without niqqud.`
    : "";
  return `You write a short reading check for a reader who has just finished reading a text. Every question, option and explanation is written in ${langName}, whatever language the text is in. ${audience}

Return ONLY a JSON object:
{
  "language": "the English name of the language the TEXT is written in (for example Hebrew, English, Arabic)",
  "words": [ one item for EVERY word in the WORDS list, in the same order: {
    "word": "the word exactly as given in the list",
    "sentence": "the whole sentence of the text in which the word appears, copied exactly from the text (same spelling, same vowel marks, same punctuation)",
    "options": [ 4 short answers in ${langName}, 1 to 6 words each: what the word could mean ],
    "answer": the index (0 to 3) of the correct option,
    "explain": "ONE short sentence in ${langName} that ties the meaning to what happens in THIS sentence, so the reader sees why it fits there. Not just a repeat of the correct option."
  } ],
  "questions": [ 3 questions for a short text, up to 5 for a longer one: {
    "q": "a short question in ${langName} about the CONTENT of the text: who, what, where, why, what happened",
    "options": [ 4 short answers in ${langName} ],
    "answer": the index (0 to 3) of the correct option
  } ]
}

Rules:
- Each word is explained in the meaning it has IN THAT SENTENCE, not its most common meaning. The correct option is that meaning, said with OTHER, simpler words: never the word itself or another form of the same root. A word with a prefix or an ending (for example Hebrew ו, ה, ב, ל, מ, ש, כ) is explained as it is used in the sentence.
- The three wrong options are plausible but clearly wrong: real meanings of other words, another meaning this word has elsewhere, or the meaning of a word that looks or sounds similar. Never a trick, never "all of the above", never two options that could both be right.
- The four options of one item are about the same length and style, so the right one does not stand out.
- The questions are answerable ONLY from the text, each with exactly one clearly correct answer. No outside knowledge, no opinions, no trick questions. Ask about the important things in the text, not tiny details. Do not ask about the meaning of the listed words again.
- Never mention AI, a model, a computer or "the text says" style meta talk inside the options.
- The name Gadit, if it ever appears, stays in Latin letters.
- Never use the em dash or en dash characters. Use a comma or a colon instead.${hebrew}
- Output ONLY the JSON object. No markdown, no preamble.`;
}

/** The exact chat-completions body the route sends (model = SMART_MODEL). */
export function readingCheckRequest(model: string, text: string, lang: string, kids: boolean, words: string[]) {
  return {
    model,
    temperature: 0.3,
    max_completion_tokens: 3500,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildPrompt(LANG_NAME[lang] ?? "English", kids, lang) },
      { role: "user", content: `TEXT:\n<<<\n${text}\n>>>\n\nWORDS: ${JSON.stringify(words)}` },
    ],
  };
}
