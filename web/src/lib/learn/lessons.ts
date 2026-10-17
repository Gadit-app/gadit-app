/**
 * Built-in workbook-style lessons (Gadi 2026-10-11: "build the practice the
 * way the workbook is built, without having to photograph it"). Every topic
 * of the English and Hebrew banks, split into lessons of 8-10 words from
 * easy to hard; each with sentences, pronoun items and a short reading text
 * with yes/no checks. Content in lessons-{en,he}.json (written once).
 */
import LESSONS_EN from "./lessons-en.json";
import LESSONS_HE from "./lessons-he.json";
import { bankFor, topicsFor, type LearnLang } from "./engine";

export type LessonReading = { title: string; text: string; checks: Array<{ s: string; yes: boolean }> };
type LessonDoc = {
  id: string; topic: string; part: number; d: number; words: string[];
  sentences: string[]; pronouns: Array<{ phrase: string; answer: string }>; reading: LessonReading | null;
};

const ALL: Record<LearnLang, LessonDoc[]> = { en: LESSONS_EN as LessonDoc[], he: LESSONS_HE as LessonDoc[] };

const topicName = (lang: LearnLang, topic: string, ui: string) => {
  const t = (topicsFor(lang) as Record<string, Record<string, string>>)[topic];
  return { name: t?.[ui] ?? t?.en ?? topic, icon: t?.icon ?? "📘" };
};

/** The list shown on the learning card, and which lesson comes next: the
 *  first one not done yet, in the workbook-like order of the file. */
export function lessonList(lang: LearnLang, ui: string, done: Record<string, number>) {
  const list = ALL[lang].map((l) => {
    const t = topicName(lang, l.topic, ui);
    return { id: l.id, topic: l.topic, title: `${t.name} ${l.part}`, icon: t.icon, d: l.d, done: !!done[l.id] };
  });
  const next = list.find((l) => !l.done)?.id ?? null;
  return { list, next };
}

/** A lesson ready to play, its words translated into the child's language. */
export function lessonData(lang: LearnLang, ui: string, id: string) {
  const l = ALL[lang].find((x) => x.id === id);
  if (!l) return null;
  const bank = new Map(bankFor(lang, ui).map((x) => [x.w.toLowerCase(), x]));
  const items = l.words.flatMap((w) => {
    const b = bank.get(w.toLowerCase());
    // en: the English side, so a Hebrew word's picture follows the English one
    // (שלום showed "peace", not "hello"; Gadi 2026-10-17).
    const en = !b ? undefined : lang === "en" ? b.w : (b as { en?: string }).en;
    return b?.t ? [{ w: b.w, t: b.t, ...(b.nq ? { nq: b.nq } : {}), ...(en ? { en } : {}) }] : [];
  });
  const t = topicName(lang, l.topic, ui);
  return { id: l.id, topic: `${t.name} ${l.part}`, items, sentences: l.sentences, pronouns: l.pronouns, reading: l.reading };
}
