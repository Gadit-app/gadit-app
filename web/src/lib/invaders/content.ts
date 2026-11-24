/**
 * The Invading Words (מילים פולשות, Gadi 2026-11-24): the words and their
 * meanings. A word stays still and is spoken; its true meanings fall from the
 * sky among impostors (meanings of other words) and the child catches every
 * true one.
 *
 * The meanings are curated by hand from the cached kids entries: repeats
 * merged, adult or obscure senses left out, each with a STABLE id (the
 * child's progress is kept per id, so rewording a gloss never loses it), a
 * short gloss in the screen's language and, when it can be drawn, an English
 * brief for its two pictures. A meaning with no brief is shown as its gloss
 * only (grade 3 and up).
 *
 * `no` lists pairs that must never meet: when one side's word is the target,
 * the other side never falls as an impostor (a table's leg while the word is
 * "table"). Built from a hand list plus an independent blind check. Words of
 * the same topic never meet either (the game's rule, lib/invaders/rules.ts
 * and the page).
 */
import he from "./he.json";

export type InvSense = { id: string; g: string; b?: string };
export type InvWord = { w: string; t: string; s: InvSense[] };
export type InvSet = { lang: string; no: string[][]; words: InvWord[] };

export const INV_SETS: Record<string, InvSet> = { he: he as InvSet };
/** Two pictures per drawn meaning, shown in turn, so a child learns the meaning, not one picture. */
export const INV_VARIANTS = 2;
