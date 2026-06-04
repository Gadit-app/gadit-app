/**
 * Cross-script keyboard-layout transliteration.
 *
 * Real-world flow this rescues: the user has a Hebrew UI selected, wants
 * to search for מסמר, but their keyboard is on English. They type the
 * physical keys for מסמר which produces "nxnr" in the URL, and the AI
 * has no idea what to do with that. detectWrongKeyboard() spots the
 * mismatch and returns the intended Hebrew word so the page can quietly
 * redirect.
 *
 * Only the HE↔EN pair is wired up here — AR / RU layouts use the same
 * mechanism if we add their tables later.
 */

// Standard Windows/Linux Hebrew layout (lcid 040d). Each entry maps a
// LOWERCASE Latin key to the Hebrew letter it produces.
const HE_FROM_EN: Record<string, string> = {
  q: "/", w: "'", e: "ק", r: "ר", t: "א", y: "ט", u: "ו", i: "ן",
  o: "ם", p: "פ", a: "ש", s: "ד", d: "ג", f: "כ", g: "ע", h: "י",
  j: "ח", k: "ל", l: "ך", z: "ז", x: "ס", c: "ב", v: "ה", b: "נ",
  n: "מ", m: "צ",
  ",": "ת", ".": "ץ", "/": ".", ";": "ף", "'": ",",
};

// Reverse table: Hebrew letter → English key.
const EN_FROM_HE: Record<string, string> = Object.fromEntries(
  Object.entries(HE_FROM_EN).map(([en, he]) => [he, en]),
);

// Hebrew final-form letters land on the same physical key as their
// non-final form, so map them back to the regular form before the
// reverse lookup.
const FINAL_TO_REGULAR: Record<string, string> = {
  "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ",
};

/** Convert "nxnr" → "מסמר" by treating each Latin key as the Hebrew
 *  letter on the same physical key. */
export function enToHebrew(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((c) => HE_FROM_EN[c] ?? c)
    .join("");
}

/** Reverse direction — useful for English UI users who typed in Hebrew. */
export function hebrewToEn(input: string): string {
  return input
    .split("")
    .map((c) => {
      const base = FINAL_TO_REGULAR[c] ?? c;
      return EN_FROM_HE[base] ?? c;
    })
    .join("");
}

const HEBREW_RE = /[֐-׿]/;
const LATIN_RE  = /[a-zA-Z]/;

/**
 * Detect wrong-keyboard inputs and return the auto-corrected word, or
 * null when the input looks fine as-is for the UI language.
 *
 * Heuristics:
 *  · uiLang = "he" and input is purely Latin (no Hebrew chars) → user
 *    almost certainly had English keyboard on. Transliterate.
 *  · uiLang = "en" and input is purely Hebrew (no Latin chars) → the
 *    inverse mistake. Transliterate.
 *  · Mixed-script inputs (Hebrew + Latin together) are left alone —
 *    too ambiguous to auto-correct.
 */
export function detectWrongKeyboard(input: string, uiLang: string): string | null {
  const t = input.trim();
  if (!t) return null;
  const hasHe = HEBREW_RE.test(t);
  const hasLat = LATIN_RE.test(t);

  if (uiLang === "he" && hasLat && !hasHe) {
    const corrected = enToHebrew(t);
    // The transliteration must actually produce Hebrew, otherwise the
    // word was Latin punctuation / digits with no real keyboard
    // collision to fix.
    return HEBREW_RE.test(corrected) ? corrected : null;
  }
  if (uiLang === "en" && hasHe && !hasLat) {
    const corrected = hebrewToEn(t);
    return LATIN_RE.test(corrected) ? corrected : null;
  }
  return null;
}
