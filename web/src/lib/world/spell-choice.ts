/**
 * Which language the child spells in, in the world game (Gadi 2026-11-01).
 *
 * The choices: the child's own language (the app's language, when it has
 * letters) and the languages they can learn (lib/learn/targets). The map
 * shows them as buttons; the pick is kept on the device, per child. With no
 * pick yet, the game uses the learning-mode language chosen on /play.
 */
import { learnTargets } from "@/lib/learn/targets";
import { NO_SPELL_LANGS } from "./letters";

export function spellOptions(ui: string): string[] {
  const own = NO_SPELL_LANGS.has(ui) ? [] : [ui];
  return [...new Set([...own, ...learnTargets(ui)])];
}

const key = (uid: string, ui: string) => `gadit-world-spell:${uid}:${ui}`;

export function readSpellChoice(uid: string, ui: string): string | null {
  try {
    const v = localStorage.getItem(key(uid, ui));
    return v && spellOptions(ui).includes(v) ? v : null;
  } catch { return null; }
}

export function writeSpellChoice(uid: string, ui: string, lang: string): void {
  try { localStorage.setItem(key(uid, ui), lang); } catch { /* private window */ }
}

/** Spelling the app's own language: words from /api/world/words, not the learning engine. */
export const isNativeSpell = (ui: string, lang: string) => lang === ui;
