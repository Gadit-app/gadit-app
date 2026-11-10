/**
 * Letter Catch pace (Din's idea, approved by Gadi 2026-11-05): slow, normal
 * or fast, picked on the word card and remembered on the device. It sets the
 * speed and how often the right letter shows up among the decoys (his mother:
 * "the game almost always offers the letter he needs").
 *
 *   slow   = the gentle start the game always had
 *   normal = starts a few words in, more decoys before the right letter
 *   fast   = starts near full speed, the most decoys
 */

export type Pace = 0 | 1 | 2;
export const PACE_KEY = "gadit-catch-pace";
export const readPace = (): Pace => {
  try { const v = localStorage.getItem(PACE_KEY); return v === "0" ? 0 : v === "2" ? 2 : 1; } catch { return 1; }
};
export const savePace = (p: Pace) => { try { localStorage.setItem(PACE_KEY, String(p)); } catch { /* fine */ } };

/** The words played so far, as the scenes count them for speed. */
export const paceLevel = (level: number, pace: Pace) => (pace === 0 ? Math.min(level, 2) * 0.5 : pace === 1 ? level + 3 : level + 7);

/** How much faster each pace runs, per scene (Osher 2026-11-10: slow and
 *  normal felt the same in Fireflies, normal and fast felt the same on the
 *  coaster, and the whole wheel at the funfair was too slow). */
export const PACE_SPEED: Record<"fireflies" | "coaster" | "target", Record<Pace, number>> = {
  fireflies: { 0: 1, 1: 1.3, 2: 1.5 },
  coaster: { 0: 1, 1: 1.1, 2: 1.45 },
  target: { 0: 1.5, 1: 1.9, 2: 2.5 },
};

/** Fireflies: the chance the next firefly carries the right letter while none on screen does, and the most decoys in a row before it must. */
export const PACE_TARGET_CHANCE: Record<Pace, number> = { 0: 1, 1: 0.5, 2: 0.33 };
export const PACE_MAX_DECOYS: Record<Pace, number> = { 0: 0, 1: 2, 2: 3 };

const L: Record<string, [string, string, string]> = {
  he: ["איטי", "רגיל", "מהיר"],
  en: ["Slow", "Normal", "Fast"],
  ar: ["بطيء", "عادي", "سريع"],
  ru: ["Медленно", "Обычно", "Быстро"],
  uk: ["Повільно", "Звичайно", "Швидко"],
  es: ["Lento", "Normal", "Rápido"],
  pt: ["Devagar", "Normal", "Rápido"],
  fr: ["Lent", "Normal", "Rapide"],
  de: ["Langsam", "Normal", "Schnell"],
  cs: ["Pomalu", "Normálně", "Rychle"],
  sk: ["Pomaly", "Normálne", "Rýchlo"],
  pl: ["Wolno", "Normalnie", "Szybko"],
  it: ["Lento", "Normale", "Veloce"],
  nl: ["Langzaam", "Normaal", "Snel"],
  da: ["Langsom", "Normal", "Hurtig"],
  el: ["Αργά", "Κανονικά", "Γρήγορα"],
  hu: ["Lassú", "Normál", "Gyors"],
  tr: ["Yavaş", "Normal", "Hızlı"],
  id: ["Pelan", "Biasa", "Cepat"],
  vi: ["Chậm", "Vừa", "Nhanh"],
  fil: ["Mabagal", "Karaniwan", "Mabilis"],
  af: ["Stadig", "Gewoon", "Vinnig"],
  sw: ["Polepole", "Kawaida", "Haraka"],
  ja: ["ゆっくり", "ふつう", "はやい"],
  "zh-CN": ["慢", "普通", "快"],
  "zh-TW": ["慢", "普通", "快"],
  ko: ["느리게", "보통", "빠르게"],
  th: ["ช้า", "ปกติ", "เร็ว"],
  hi: ["धीमा", "सामान्य", "तेज़"],
  bn: ["ধীরে", "সাধারণ", "দ্রুত"],
  am: ["ቀስ ብሎ", "መደበኛ", "ፈጣን"],
  fa: ["آهسته", "معمولی", "تند"],
  zu: ["Kancane", "Okujwayelekile", "Ngokushesha"],
  xh: ["Kancinci", "Okuqhelekileyo", "Ngokukhawuleza"],
  nso: ["Ka go nanya", "Ka mehla", "Ka lebelo"],
  tn: ["Ka bonya", "Ka tlwaelo", "Ka bonako"],
  st: ["Butle", "Ka tlwaelo", "Ka potlako"],
  ts: ["Hi ku nonoka", "Hi ntolovelo", "Hi ku hatlisa"],
  ss: ["Kancane", "Lokujwayelekile", "Ngekushesha"],
  ve: ["Nga zwiṱuku", "Zwi ḓoweleaho", "Nga u ṱavhanya"],
  nr: ["Kancani", "Okujayelekileko", "Msinyana"],
};
export const PACE_ICON: Record<Pace, string> = { 0: "🐢", 1: "🙂", 2: "🚀" };
export const paceLabels = (lang: string): [string, string, string] => L[lang] ?? L.en;
