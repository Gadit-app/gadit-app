/**
 * Hebrew text for a device's own voice (Web Speech).
 *
 * A furtive patah (פתח גנובה) is written under the last letter of a word but
 * read BEFORE it: לְנַצֵּחַ is "le-na-tse-ach", תַּפּוּחַ is "ta-pu-ach". A device voice
 * reads the sign where it is written and says "le-na-tse-cha" (a parent's
 * note, Gadi 2026-11-15). For the voice only, the patah moves onto an alef
 * before the letter: לְנַצֵּאַח. What is shown on the screen never changes.
 *
 * Only a word-final ח or ע that carries a patah, or a ה with a mappiq and a
 * patah (גָּבֹהַּ), after at least one more letter. Our server voice (Gemini
 * "Aoede") reads these words right as they are, so it gets the text unchanged.
 */
const FURTIVE = /(?<=[א-ת][֑-ׇ]*)([חע])ַ(?![֑-ׇא-ת])/g;
const FURTIVE_HE = /(?<=[א-ת][֑-ׇ]*)ה(?:ַּ|ַּ)(?![֑-ׇא-ת])/g;

export function forDeviceVoice(text: string): string {
  if (!text.includes("ַ")) return text;
  return text.replace(FURTIVE, "אַ$1").replace(FURTIVE_HE, "אַהּ");
}
