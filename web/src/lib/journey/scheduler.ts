/**
 * The word cards' scheduler (Gadi 2026-11-14, the council's first step).
 *
 * A word a child met becomes a card. The card enters the child's index only
 * after three right answers on three different days. After that it comes
 * back at growing gaps (a week, a month, three months, a year) and its frame
 * upgrades by the longest gap it survived.
 *
 * The rules, all of them here and nowhere else:
 *  - One star a day at most. A second right answer on the same day is
 *    practice: it is counted, it changes nothing.
 *  - A wrong answer never takes anything away. No star is lost, no frame
 *    is lost. The card simply comes back tomorrow. The right answer a
 *    minute after a wrong one is practice too (the child has just been
 *    shown the meaning), so the star waits for the next day.
 *  - Nothing fades while the child is away. A card that was due last month
 *    is simply due today; the longer gap can only earn a better frame.
 *  - A day shows eight cards at most and never a backlog.
 *  - Three formats: the scheduler does not refuse a star over the format,
 *    it tells the game which format to ask in next (pickFormat), so a word
 *    with three formats on offer is always asked in three.
 *
 * Pure functions: no clock, no storage, no network. A "day" is a
 * YYYY-MM-DD key in the child's own time zone (dayKeyOf).
 */

export const STARS_TO_KNOW = 3;
export const DAILY_MAX = 8;
export const NEW_PER_DAY = 3;
/** Days until the next star: after the 1st, after the 2nd. */
export const STAR_WAIT = [1, 2];
/** Days between reviews once the card is in the index. */
export const GAPS = [7, 30, 90, 365];

export type Frame = "plain" | "silver" | "gold" | "rainbow" | "diamond";
export const FRAMES: Frame[] = ["plain", "silver", "gold", "rainbow", "diamond"];

export type Card = {
  id: string;
  /** 0 to 3. Never goes down. */
  stars: number;
  /** The day of each star. */
  starDays: string[];
  /** The format of each star's answer. */
  formats: string[];
  /** The day the card entered the index, or null. */
  knownDay: string | null;
  /** The first day the card is one of the day's cards again. */
  dueDay: string;
  /** Which gap of GAPS the card is waiting through (index cards only). */
  gapStep: number;
  /** A wrong answer on a review: the same gap is waited again, not a longer one. */
  relearn: boolean;
  /** The day the current gap is measured from. */
  gapFrom: string | null;
  /** The longest gap, in days, that ended in a right answer. */
  longestGap: number;
  right: number;
  wrong: number;
  lastDay: string | null;
  /** The last day the card was one of the day's cards and was answered. */
  creditDay: string | null;
};

export type AnswerEvent =
  | "practice" // not due, or already answered for credit today
  | "star" // a star, not yet in the index
  | "known" // the third star: the card enters the index
  | "kept" // a review answered right
  | "again"; // a wrong answer: back tomorrow

export type AnswerResult = { card: Card; event: AnswerEvent; frameUp: Frame | null };

/** The YYYY-MM-DD of this moment in a time zone (the child's, not the server's). */
export function dayKeyOf(at: Date, timeZone = "UTC"): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
  } catch {
    return at.toISOString().slice(0, 10);
  }
}
const toMs = (day: string): number => Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10));
export function addDays(day: string, n: number): string {
  return new Date(toMs(day) + n * 86400000).toISOString().slice(0, 10);
}
export function diffDays(from: string, to: string): number {
  return Math.round((toMs(to) - toMs(from)) / 86400000);
}

export function frameOf(longestGap: number): Frame {
  if (longestGap >= GAPS[3]) return "diamond";
  if (longestGap >= GAPS[2]) return "rainbow";
  if (longestGap >= GAPS[1]) return "gold";
  if (longestGap >= GAPS[0]) return "silver";
  return "plain";
}
export const isKnown = (c: Card): boolean => c.knownDay !== null;
export const isDue = (c: Card, today: string): boolean => c.dueDay <= today;

/** A word the child met on `foundDay`. It arrives face down and can be
 *  opened from the next day on. */
export function newCard(id: string, foundDay: string): Card {
  return {
    id, stars: 0, starDays: [], formats: [], knownDay: null,
    dueDay: addDays(foundDay, 1), gapStep: 0, relearn: false, gapFrom: null,
    longestGap: 0, right: 0, wrong: 0, lastDay: null, creditDay: null,
  };
}

/** What one answer does to a card. Returns a new card; the old one is untouched. */
export function answer(card: Card, a: { correct: boolean; format: string; day: string }): AnswerResult {
  const c: Card = { ...card, starDays: [...card.starDays], formats: [...card.formats], lastDay: a.day };
  if (a.correct) c.right++; else c.wrong++;
  // Not one of the day's cards (not due yet, or already answered for credit on this day).
  if (!isDue(card, a.day)) return { card: c, event: "practice", frameUp: null };
  c.creditDay = a.day;

  if (!a.correct) {
    c.dueDay = addDays(a.day, 1);
    if (isKnown(c)) { c.relearn = true; c.gapFrom = a.day; }
    return { card: c, event: "again", frameUp: null };
  }

  if (!isKnown(c)) {
    c.stars = Math.min(STARS_TO_KNOW, c.stars + 1);
    c.starDays.push(a.day);
    c.formats.push(a.format);
    if (c.stars >= STARS_TO_KNOW) {
      c.knownDay = a.day; c.gapStep = 0; c.relearn = false; c.gapFrom = a.day;
      c.dueDay = addDays(a.day, GAPS[0]);
      return { card: c, event: "known", frameUp: null };
    }
    c.dueDay = addDays(a.day, STAR_WAIT[c.stars - 1] ?? 1);
    return { card: c, event: "star", frameUp: null };
  }

  // A review of a card that is already in the index.
  const before = frameOf(c.longestGap);
  const gap = c.gapFrom ? diffDays(c.gapFrom, a.day) : 0;
  if (gap > c.longestGap) c.longestGap = gap;
  if (c.relearn) c.relearn = false; // the same gap is waited again
  else c.gapStep = Math.min(GAPS.length - 1, c.gapStep + 1);
  c.gapFrom = a.day;
  c.dueDay = addDays(a.day, GAPS[c.gapStep]);
  const after = frameOf(c.longestGap);
  return { card: c, event: "kept", frameUp: after !== before ? after : null };
}

/**
 * The cards of the day: eight at most, never a backlog. `usedToday` is how
 * many cards the child already answered for credit on this day.
 * Order: cards one or two stars from the index (oldest due first), then
 * reviews of index cards, then cards never opened (three a day at most).
 * A card never opened always gets one place when there is one, so a child
 * with a long tail of started cards still opens something new every day.
 */
export function dueToday(cards: Card[], today: string, opts: { max?: number; newMax?: number; usedToday?: number } = {}): Card[] {
  const room = Math.max(0, (opts.max ?? DAILY_MAX) - (opts.usedToday ?? 0));
  if (!room) return [];
  const byDue = (a: Card, b: Card) => (a.dueDay < b.dueDay ? -1 : a.dueDay > b.dueDay ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const due = cards.filter((c) => isDue(c, today));
  const started = due.filter((c) => !isKnown(c) && c.stars > 0).sort((a, b) => b.stars - a.stars || byDue(a, b));
  const reviews = due.filter(isKnown).sort(byDue);
  const fresh = due.filter((c) => !isKnown(c) && c.stars === 0).sort(byDue);
  const older = [...started, ...reviews];
  const firstOlder = older.slice(0, Math.max(0, room - (fresh.length ? 1 : 0)));
  const newOnes = fresh.slice(0, Math.min(opts.newMax ?? NEW_PER_DAY, room - firstOlder.length));
  const restOlder = older.slice(firstOlder.length, firstOlder.length + (room - firstOlder.length - newOnes.length));
  return [...firstOlder, ...restOlder, ...newOnes];
}

/** The format to ask in: one the card has no star in yet, else the one used longest ago. */
export function pickFormat(card: Card, available: string[]): string | null {
  if (!available.length) return null;
  const unused = available.find((f) => !card.formats.includes(f));
  if (unused) return unused;
  return [...available].sort((a, b) => card.formats.lastIndexOf(a) - card.formats.lastIndexOf(b))[0];
}

/** The numbers the child and the parent see. */
export function summary(cards: Card[], today: string): { index: number; started: number; fresh: number; due: number; frames: Record<Frame, number> } {
  const frames: Record<Frame, number> = { plain: 0, silver: 0, gold: 0, rainbow: 0, diamond: 0 };
  let index = 0, started = 0, fresh = 0, due = 0;
  for (const c of cards) {
    if (isKnown(c)) { index++; frames[frameOf(c.longestGap)]++; }
    else if (c.stars > 0) started++;
    else fresh++;
    if (isDue(c, today)) due++;
  }
  return { index, started, fresh, due, frames };
}

/** Coins come only from words in the index: each card is worth its frame. */
export const FRAME_COINS: Record<Frame, number> = { plain: 10, silver: 30, gold: 70, rainbow: 150, diamond: 310 };
export function coinsOf(cards: Card[]): number {
  let n = 0;
  for (const c of cards) if (isKnown(c)) n += FRAME_COINS[frameOf(c.longestGap)];
  return n;
}

/** How many of the day's cards the child already answered for credit today. */
export function usedOn(cards: Card[], today: string): number {
  let n = 0;
  for (const c of cards) if (c.creditDay === today) n++;
  return n;
}
