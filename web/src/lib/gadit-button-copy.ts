/**
 * gadit-button-copy — the "Gad it!" button on the word page (Gadi 2026-10-18,
 * after 7 assistants answered the same prompt). Tapping opens ONE quick
 * question; only a correct answer marks the word understood (+10, once).
 *
 * The brand phrase stays English ("Gad it!", "Now I gad it!") with a small
 * hint in the reader's language, EXCEPT where "gad" sounds bad: in Russian,
 * Ukrainian, Polish, Czech and Slovak "гад/gad" is an insult or "vermin",
 * in Persian "gada" is a beggar and in Hindi "gadha" a donkey. Those
 * languages get a plain local phrase and never show "gad".
 */
import { GADIT_BUTTON_I18N } from "@/lib/gadit-button-i18n";

export type GadKey = "button" | "hint" | "success" | "doneSub" | "alreadySub" | "wrong";

/** Languages where "gad" must never be shown or said. */
export const NO_GAD_LANGS = new Set(["ru", "uk", "pl", "cs", "sk", "fa", "hi"]);

const BASE: Record<"en" | "he", Record<GadKey, string>> = {
  en: {
    button: "Gad it!",
    hint: "One quick question to check you understood",
    success: "Now I gad it!",
    doneSub: "The word is marked as understood in your notebook.",
    alreadySub: "This word is already in your understood words.",
    wrong: "Almost! Read the explanation again and try another time.",
  },
  he: {
    button: "Gad it!",
    hint: "שאלה אחת קצרה, כדי לבדוק שהבנתם",
    success: "Now I gad it!",
    doneSub: "המילה סומנה במחברת כמילה שהבנתם.",
    alreadySub: "המילה הזאת כבר נמצאת אצלכם במילים שהבנתם.",
    wrong: "כמעט! קראו שוב את ההסבר ונסו בפעם אחרת.",
  },
};

export function gadCopy(lang: string): Record<GadKey, string> {
  const own = (BASE as Record<string, Record<GadKey, string>>)[lang] ?? GADIT_BUTTON_I18N[lang] ?? {};
  const out = { ...BASE.en, ...own } as Record<GadKey, string>;
  // Safety net: a language on the no-gad list never falls back to the English brand phrase.
  if (NO_GAD_LANGS.has(lang) && (/gad/i.test(out.button) || /gad/i.test(out.success))) {
    out.button = "✓";
    out.success = "✓";
  }
  return out;
}
