"use client";

/**
 * Levels for the puzzles: word search, crossword, arrowword (Gadi 2026-11-11:
 * "טקט" in a child's crossword is too hard; puzzles go by age). Three levels,
 * chosen on a small screen before the puzzle; the suggested one follows the
 * member's age, the last choice is remembered per person, and a chip above
 * the grid leads back to the choice.
 *   easy   (6-8):  first words of the bank only, 3-4 letters, the PICTURE is the clue
 *   medium (9-11): the child's words + the bank, up to 6 letters, the clue in simple words
 *   hard   (12+):  the puzzles as they were
 * Also here: the words a clue puzzle is built from, per level, their pictures
 * (looked up before the grid is drawn, so a word with no clue at all is never
 * placed), and the sentence-with-a-gap used by the second hint.
 */

import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { useAuth } from "@/lib/auth-context";
import type { PlayWord } from "@/lib/play-engine";
import { dirForLang, shuffle, wordLangOf } from "@/lib/play-engine";
import { readKidsMode } from "@/lib/use-kids-mode";
import { HEBREW_BANK } from "@/lib/learn/hebrew-bank";
import { ENGLISH_BANK } from "@/lib/learn/english-bank";
import { gridLetters } from "@/lib/puzzles/word-search";
import { PlayHeader, type PlayT } from "./GameQuiz";

export type PuzzleLevel = "easy" | "medium" | "hard";
const LEVELS: PuzzleLevel[] = ["easy", "medium", "hard"];

type LCopy = { pick: string; level: string; change: string; names: Record<PuzzleLevel, string>; ages: Record<PuzzleLevel, string>; clueLines: Record<PuzzleLevel, string>; searchLines: Record<PuzzleLevel, string>; hints: (n: number) => string; building: string; sentence: string };
const L: Record<string, LCopy> = {
  he: {
    pick: "באיזו רמה משחקים?", level: "רמה", change: "החלפת רמה",
    names: { easy: "קל", medium: "בינוני", hard: "קשה" },
    ages: { easy: "גיל 6 עד 8", medium: "גיל 9 עד 11", hard: "גיל 12 ומעלה" },
    clueLines: { easy: "מילים קצרות, וההגדרה היא תמונה", medium: "המילים שלכם, עם הסבר במילים פשוטות", hard: "מילים ארוכות יותר והגדרות מלאות" },
    searchLines: { easy: "לוח קטן ומילים קצרות", medium: "לוח בינוני, המילים בכיוון הקריאה", hard: "לוח גדול, מילים גם הפוך" },
    hints: (n) => (n === 0 ? "פתרתם בלי רמזים" : n === 1 ? "פתרתם עם רמז אחד" : `פתרתם עם ${n} רמזים`),
    building: "מכינים את הלוח", sentence: "המילה חסרה במשפט",
  },
  en: {
    pick: "Which level?", level: "Level", change: "Change level",
    names: { easy: "Easy", medium: "Medium", hard: "Hard" },
    ages: { easy: "Ages 6 to 8", medium: "Ages 9 to 11", hard: "Ages 12 and up" },
    clueLines: { easy: "Short words, and the clue is a picture", medium: "Your words, explained in simple words", hard: "Longer words and full clues" },
    searchLines: { easy: "A small grid and short words", medium: "A medium grid, words in reading direction", hard: "A big grid, words backwards too" },
    hints: (n) => (n === 0 ? "Solved with no hints" : n === 1 ? "Solved with 1 hint" : `Solved with ${n} hints`),
    building: "Setting up the grid", sentence: "The word is missing from the sentence",
  },
  ar: {
    pick: "أي مستوى؟", level: "المستوى", change: "تغيير المستوى",
    names: { easy: "سهل", medium: "متوسط", hard: "صعب" },
    ages: { easy: "من 6 إلى 8 سنوات", medium: "من 9 إلى 11 سنة", hard: "من 12 سنة فما فوق" },
    clueLines: { easy: "كلمات قصيرة، والتعريف صورة", medium: "كلماتكم، مع شرح بكلمات بسيطة", hard: "كلمات أطول وتعريفات كاملة" },
    searchLines: { easy: "شبكة صغيرة وكلمات قصيرة", medium: "شبكة متوسطة، الكلمات باتجاه القراءة", hard: "شبكة كبيرة، والكلمات بالعكس أيضًا" },
    hints: (n) => (n === 0 ? "الحل بدون تلميحات" : n === 1 ? "الحل بتلميح واحد" : `عدد التلميحات: ${n}`),
    building: "نجهّز الشبكة", sentence: "الكلمة ناقصة في الجملة",
  },
  ru: {
    pick: "Какой уровень?", level: "Уровень", change: "Сменить уровень",
    names: { easy: "Лёгкий", medium: "Средний", hard: "Сложный" },
    ages: { easy: "6-8 лет", medium: "9-11 лет", hard: "12 лет и старше" },
    clueLines: { easy: "Короткие слова, подсказка в картинке", medium: "Ваши слова с объяснением простыми словами", hard: "Слова длиннее и полные определения" },
    searchLines: { easy: "Маленькая сетка и короткие слова", medium: "Средняя сетка, слова в направлении чтения", hard: "Большая сетка, слова и задом наперёд" },
    hints: (n) => (n === 0 ? "Решено без подсказок" : n === 1 ? "Решено с 1 подсказкой" : `Решено с подсказками: ${n}`),
    building: "Готовим сетку", sentence: "В предложении не хватает слова",
  },
};
export const levelCopy = (lang: string): LCopy => L[lang] ?? L.en;

/** The level suggested for this player: by age, else by Kids Mode. */
export function defaultLevel(age: number | null, kids: boolean): PuzzleLevel {
  if (typeof age === "number") return age <= 8 ? "easy" : age <= 11 ? "medium" : "hard";
  return kids ? "medium" : "hard";
}
const keyFor = (uid: string | undefined) => `gadit-puzzle-level:${uid ?? "anon"}`;
function readLevel(uid: string | undefined): PuzzleLevel | null {
  try { const v = window.localStorage.getItem(keyFor(uid)); return v === "easy" || v === "medium" || v === "hard" ? v : null; } catch { return null; }
}
function writeLevel(uid: string | undefined, l: PuzzleLevel) { try { window.localStorage.setItem(keyFor(uid), l); } catch { /* not remembered */ } }

/** The level of this sitting: null until picked on the chooser; `reopen` leads back to it. */
export function usePuzzleLevel() {
  const { user, memberAge } = useAuth();
  const [kids] = useState(() => readKidsMode());
  const [level, setLevel] = useState<PuzzleLevel | null>(null);
  const [picked, setPicked] = useState<PuzzleLevel | null>(null);
  const uid = user?.uid;
  const stored = useMemo(() => readLevel(uid), [uid]);
  const suggested = picked ?? stored ?? defaultLevel(memberAge, kids);
  const choose = (l: PuzzleLevel) => { writeLevel(uid, l); setPicked(l); setLevel(l); };
  return { level, suggested, kids, choose, reopen: () => setLevel(null) };
}

export function LevelChooser({ title, kind, suggested, onPick, onExit, lang, t }: { title: string; kind: "clue" | "search"; suggested: PuzzleLevel; onPick: (l: PuzzleLevel) => void; onExit: () => void; lang: string; t: PlayT }) {
  const c = levelCopy(lang);
  const lines = kind === "clue" ? c.clueLines : c.searchLines;
  return (
    <div className="wb-play-stage pz-levels">
      <style>{LEVEL_CSS}</style>
      <PlayHeader title={title} onExit={onExit} t={t} />
      <div className="wb-play-question pz-levels-q" dir={dirForLang(lang)}>
        <div className="pz-levels-title">{c.pick}</div>
        {LEVELS.map((l) => (
          <button key={l} type="button" className={`pz-level is-${l}${l === suggested ? " is-suggested" : ""}`} data-level={l} onClick={() => onPick(l)}>
            <b>{c.names[l]}</b>
            <span className="pz-level-age">{c.ages[l]}</span>
            <span className="pz-level-line">{lines[l]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Above the grid: the level being played; a tap leads back to the chooser. */
export function LevelChip({ level, onChange, lang }: { level: PuzzleLevel; onChange: () => void; lang: string }) {
  const c = levelCopy(lang);
  return (
    <button type="button" className="pz-chip" onClick={onChange} aria-label={c.change} dir={dirForLang(lang)}>
      {c.level}: <b>{c.names[level]}</b> <span aria-hidden="true">⇄</span>
    </button>
  );
}

// ─── The words of a clue puzzle (crossword, arrowword) ──────────

export type ClueItem = {
  word: string; lang: "he" | "en"; clue: string; pic?: string; example?: string;
  /** Easy level only: one of the child's own words, kept aside for when the pictures do not come. */
  spare?: boolean;
};

/** The first clause of a meaning, short enough for a clue. */
export function shortClue(meaning: string): string {
  const m = meaning.replace(/\s+/g, " ").trim();
  const cut = m.split(/[.;:!?]|, /)[0].trim();
  const words = cut.split(" ");
  return words.length > 12 ? words.slice(0, 12).join(" ") + "…" : cut;
}

const NIQQUD = /[֑-ׇ]/g;
/** An example sentence of the word with the word left out, for the second hint. Only a stored example. */
export function blankExample(word: string, examples: string[] | undefined): string | undefined {
  const w = word.replace(NIQQUD, "").toLowerCase();
  if (w.length < 2) return undefined;
  for (const ex of examples ?? []) {
    const plain = ex.replace(NIQQUD, "");
    const at = plain.toLowerCase().indexOf(w);
    if (at < 0 || plain.length > 140) continue;
    // The whole word only: "cat" inside "category" gave the hint "____egory". A Hebrew
    // word may carry a prefix letter before it (בבית), never more letters after it.
    const letter = /\p{L}/u;
    const before = plain[at - 1] ?? " ", after = plain[at + w.length] ?? " ";
    if (letter.test(after) || (letter.test(before) && !/[א-ת]/.test(w))) continue;
    const out = plain.slice(0, at) + "____" + plain.slice(at + w.length);
    if (!out.toLowerCase().includes(w)) return out;
  }
  return undefined;
}

export type ClueSettings = { maxLen: number; n: number; maxSide: number };
/** Grid and word sizes per level. `hardSide` is the grown-up grid of the game. */
export function clueSettings(level: PuzzleLevel, kids: boolean, hardSide: number): ClueSettings {
  if (level === "easy") return { maxLen: 4, n: 4, maxSide: 6 };
  if (level === "medium" || kids) return { maxLen: 6, n: 5, maxSide: 8 };
  return { maxLen: hardSide, n: 8, maxSide: hardSide };
}

function bankItems(ui: string, maxD: number, maxLen: number, of: "he" | "en" = ui === "he" ? "he" : "en"): ClueItem[] {
  const all: ClueItem[] = of === "he"
    ? HEBREW_BANK.filter((x) => !/[\s-]/.test(x.w) && x.en && x.d <= maxD).map((x) => ({ word: x.w, lang: "he" as const, clue: "", pic: x.en }))
    : ENGLISH_BANK.filter((x) => !/[\s'-]/.test(x.w) && x.d <= maxD).map((x) => ({ word: x.w, lang: "en" as const, clue: ui === "ar" ? x.ar : ui === "ru" ? x.ru : ui === "he" ? x.he : "", pic: x.w }));
  return all.filter((x) => { const k = gridLetters(x.word, x.lang === "he").length; return k >= 3 && k <= maxLen; });
}

/** The child's own words that fit the grid, by language, each with its clue in words and its picture word. */
function ownItems(pool: PlayWord[], simple: boolean, maxLen: number): Map<"he" | "en", ClueItem[]> {
  const groups = new Map<"he" | "en", ClueItem[]>();
  for (const p of pool) {
    const w = p.word.trim();
    const l = wordLangOf(p);
    if (!/^[\p{L}֑-ׇ]+$/u.test(w) || (l !== "he" && l !== "en")) continue;
    const len = gridLetters(w, l === "he").length;
    if (len < 3 || len > maxLen) continue;
    const clue = shortClue((simple && p.simple) || p.meaning || "");
    const pic = p.picWord ?? (l === "en" ? w : undefined);
    if (!clue && !pic) continue;
    const g = groups.get(l) ?? [];
    if (!g.some((x) => x.word.toLowerCase() === w.toLowerCase())) g.push({ word: w, lang: l, clue, pic, example: blankExample(w, p.examples) });
    groups.set(l, g);
  }
  return groups;
}

/** Candidate words for a clue puzzle, more than the grid needs: some may have no picture or not cross in. */
export function clueCandidates(pool: PlayWord[], ui: string, level: PuzzleLevel, s: ClueSettings): ClueItem[] {
  if (level === "easy") {
    const bank = shuffle(bankItems(ui, 2, s.maxLen)).slice(0, 48);
    // When the pictures do not come (the lookup failed), a bank word has nothing to show as
    // its clue. The child's own short words stand by with their meaning in simple words, so
    // the puzzle is built from words that have a clue (Gadi 2026-11-12).
    const have = new Set(bank.map((x) => x.word.toLowerCase()));
    const own = (bank[0] ? ownItems(pool, true, s.maxLen).get(bank[0].lang) ?? [] : [])
      .filter((x) => x.clue && !have.has(x.word.toLowerCase()))
      .map((x): ClueItem => ({ ...x, pic: undefined, spare: true }));
    return [...bank, ...shuffle(own).slice(0, 12)];
  }
  const groups = ownItems(pool, level === "medium", s.maxLen);
  let best: ClueItem[] = [];
  for (const [l, g] of groups) if (g.length > best.length || (g.length === best.length && l === ui)) best = g;
  if (best.length >= 5) return shuffle(best).slice(0, s.n + 6);
  // Too few of the child's words: the bank fills in, in the language of those words (a grid
  // holds one language), and never a word that is already there (a double could not be finished).
  const have = new Set(best.map((x) => x.word.toLowerCase()));
  const fits = bankItems(ui, level === "medium" ? 3 : 5, s.maxLen, best[0]?.lang).filter((x) => !have.has(x.word.toLowerCase()));
  return [...shuffle(best), ...shuffle(fits).slice(0, 24)];
}

/** The words the grid is built from: only words that have a clue to show (easy: a picture). */
export function clueItems(cands: ClueItem[], pics: Record<string, string>, level: PuzzleLevel, n: number): ClueItem[] {
  const hasPic = (x: ClueItem) => !!x.pic && !!pics[x.pic.toLowerCase()];
  const withPic = cands.filter((x) => !x.spare && hasPic(x));
  // Easy without (enough) pictures: every word that has a clue in words, never a word with no clue at all.
  const usable = level === "easy" && withPic.length >= 3 ? withPic : cands.filter((x) => x.clue || hasPic(x));
  const from = usable.length >= 3 ? usable : cands;
  const one = from[0]?.lang;
  return from.filter((x) => x.lang === one).slice(0, n + 3);
}

/** Pictures of the candidate words (a read-only lookup). `ready` turns true when they arrived, or could not. */
export function useCluePics(user: User | null, cands: ClueItem[]): { pics: Record<string, string>; ready: boolean } {
  const [state, setState] = useState<{ for: ClueItem[] | null; pics: Record<string, string> }>({ for: null, pics: {} });
  const want = useMemo(() => [...new Set(cands.map((x) => x.pic).filter((x): x is string => !!x))].slice(0, 60), [cands]);
  useEffect(() => {
    let alive = true;
    // Once only: an answer that arrives after the 6s give-up must not redraw a grid being solved.
    let settled = false;
    const done = (pics: Record<string, string>) => { if (alive && !settled) { settled = true; setState({ for: cands, pics }); } };
    if (!user || !want.length) { done({}); return; }
    const giveUp = setTimeout(() => done({}), 6000);
    void (async () => {
      try {
        const r = await fetch("/api/play/images", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` }, body: JSON.stringify({ words: want }) });
        const got = r.ok ? (((await r.json()) as { images?: Record<string, string> }).images ?? {}) : {};
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(got)) out[k.toLowerCase()] = v;
        clearTimeout(giveUp); done(out);
      } catch { clearTimeout(giveUp); done({}); }
    })();
    return () => { alive = false; clearTimeout(giveUp); };
  }, [user, cands, want]);
  return { pics: state.for === cands ? state.pics : {}, ready: state.for === cands };
}

export const LEVEL_CSS = `
.pz-levels .pz-levels-q { display: grid; gap: 12px; justify-items: stretch; width: min(92vw, 420px); margin-inline: auto; }
.pz-levels-title { text-align: center; font-size: 22px; font-weight: 800; color: #14202b; }
.pz-level { display: grid; gap: 2px; text-align: start; padding: 14px 18px; border-radius: 18px; border: 2px solid #d9d2c0; background: #fffdf6; color: #14202b; font: inherit; cursor: pointer; box-shadow: 0 3px 0 #0001; }
.pz-level b { font-size: 21px; font-weight: 800; }
.pz-level.is-easy b { color: #0a7a3d; }
.pz-level.is-medium b { color: #b45309; }
.pz-level.is-hard b { color: #b3261e; }
.pz-level-age { font-size: 14px; font-weight: 700; color: #374151; }
.pz-level-line { font-size: 15px; color: #374151; }
.pz-level.is-suggested { border-color: #0a7472; background: #e6f6f4; box-shadow: 0 3px 0 #0a747233; }
.pz-level:active { transform: translateY(1px); box-shadow: none; }
.pz-chip { font: inherit; font-size: 14px; font-weight: 600; padding: 5px 14px; border-radius: 999px; border: 1.5px solid #0a7472; background: #ffffff; color: #0a7472; cursor: pointer; }
.pz-chip b { font-weight: 800; }
.pz-wait { min-height: 200px; display: grid; place-items: center; font-size: 18px; font-weight: 600; color: #14202b; }
.pz-hintbox { display: grid; justify-items: center; gap: 4px; padding: 8px 14px; border-radius: 14px; background: #fff7d6; border: 1.5px solid #f2b705; color: #14202b; font-size: 16px; line-height: 1.5; max-width: 52ch; text-align: center; }
.pz-hintbox small { font-size: 12px; font-weight: 700; color: #7a5326; }
.pz-hintbox img { width: 110px; height: 110px; border-radius: 14px; object-fit: cover; }
`;
