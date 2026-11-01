/**
 * Which language the child spells in, in the world game (Gadi 2026-11-01).
 *
 * Any language with letters (Gadi 2026-11-01: "why not a language
 * picker"). The map shows a picker; the pick is kept on the device, per
 * child. With no pick yet, the game uses the learning-mode language chosen
 * on /play. English or Hebrew as a learned language (lib/learn/targets) run
 * on the learning engine; every other pick on /api/world/words.
 */
import { learnTargets } from "@/lib/learn/targets";
import { NO_SPELL_LANGS } from "./letters";
import { LANGUAGES } from "@/lib/i18n";

export function spellOptions(): string[] {
  return LANGUAGES.map((l) => l.code as string).filter((c) => !NO_SPELL_LANGS.has(c));
}

const key = (uid: string, ui: string) => `gadit-world-spell:${uid}:${ui}`;

export function readSpellChoice(uid: string, ui: string): string | null {
  try {
    const v = localStorage.getItem(key(uid, ui));
    return v && spellOptions().includes(v) ? v : null;
  } catch { return null; }
}

export function writeSpellChoice(uid: string, ui: string, lang: string): void {
  try { localStorage.setItem(key(uid, ui), lang); } catch { /* private window */ }
}

/** Words from /api/world/words (not the learning engine): any pick but a learned English or Hebrew. */
export const isBankSpell = (ui: string, lang: string) => !learnTargets(ui).includes(lang as "en" | "he");
