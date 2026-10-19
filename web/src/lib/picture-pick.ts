import { DICTATION_SETS } from "@/lib/dictation-sets";
import { BAND_SETS } from "@/lib/band-sets";

/**
 * "Listen and pick the picture" (Homework, for children who don't read yet,
 * approved 2026-10-14): the child hears a word and picks its picture out of
 * three. Only on the ready topics, and only those a picture can tell apart:
 * not days and months, not Band I's actions, describing words, feelings,
 * time or numbers past twelve, and not Band II (middle school). One picture
 * per English word, made on first use and shared by every child and every
 * language (lib/classroom-image.ts, pickImage).
 */

/** The curated Homework topics that work as pictures. */
export const PIC_DICT_SET_IDS = new Set(DICTATION_SETS.map((s) => s.id).filter((id) => id !== "days"));
/** Band I topics that work as pictures. */
export const PIC_BAND_TOPICS = new Set([
  "animals", "food and drink", "family and people", "body", "clothes", "home and furniture", "school",
  "colours", "weather and nature", "places in town", "transport", "sports and games", "jobs", "shapes and sizes",
]);
export const isPicBandSet = (b: { band: string; topic: string }) => b.band === "band1" && PIC_BAND_TOPICS.has(b.topic);

const key = (w: string) => w.trim().toLowerCase();

// Every English word a picture may be made for, with its topic (it tells the
// picture brief which meaning: "orange" the colour or the fruit is decided
// by the first topic that asks).
const PIC_WORDS = new Map<string, string>();
for (const s of DICTATION_SETS) {
  if (!PIC_DICT_SET_IDS.has(s.id)) continue;
  for (const w of s.words) if (!PIC_WORDS.has(key(w.en))) PIC_WORDS.set(key(w.en), s.titleEn);
}
for (const b of BAND_SETS) {
  if (!isPicBandSet(b)) continue;
  for (const w of b.words) if (!PIC_WORDS.has(key(w))) PIC_WORDS.set(key(w), b.topic);
}

/** The topic of a word a picture may be made for, else undefined. */
export const picWordTopic = (w: string) => PIC_WORDS.get(key(w));
