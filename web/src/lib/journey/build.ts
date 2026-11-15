/**
 * "Build the word": the journey's recall question (Gadi 2026-11-15, after the
 * review by seven AI models found that every question was a choice, so a
 * child who tapped at random still reached three stars in the end).
 *
 * The child sees the meaning and puts the word together from letter tiles.
 * It cannot be guessed, so it is the question a word's THIRD star comes
 * from: a word enters the index only after the child produced it once.
 *
 * Only a single short word is asked this way; a phrase or a long word keeps
 * the other formats. Shared by the server (which format to ask) and the screens.
 */

/** The letters of a word as the child must place them: no vowel signs, lower case. */
export function lettersOf(word: string): string[] {
  return [...word.normalize("NFC").replace(/[֑-ׇ]/g, "").toLowerCase()];
}

/** A single word of 3 to 8 letters, Hebrew or Latin, with nothing else in it. */
export function buildable(word: string): boolean {
  const l = lettersOf(word.trim());
  if (l.length < 3 || l.length > 8) return false;
  const s = l.join("");
  return /^[א-ת]+$/.test(s) || /^[a-z]+$/.test(s);
}

const HE = "אבגדהוזחטיכלמנסעפצקרשת";
const EN = "abcdefghijklmnopqrstuvwxyz";

/** The tiles to choose from: the word's letters and `extra` letters that are not in it, shuffled. */
export function tilesOf(word: string, extra: number): string[] {
  const letters = lettersOf(word.trim());
  const pool = [...(/[א-ת]/.test(letters[0] ?? "") ? HE : EN)].filter((ch) => !letters.includes(ch));
  const out = [...letters];
  for (let i = 0; i < extra && pool.length; i++) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  // Never hand the word over already in order.
  if (out.slice(0, letters.length).join("") === letters.join("") && out.length > 1) [out[0], out[1]] = [out[1], out[0]];
  return out;
}
