/**
 * School-subject senses of a word, from every curriculum unit we built (IL
 * Hebrew and Arabic catalogs, CAPS). Stored once in curriculumWords/{id}.
 * /api/define passes them to the model as a hint, so a workbook term gets
 * its textbook meaning as one of the regular meanings (Gadi 2026-10-11,
 * after Gat found מחסר and מחוסר without their arithmetic sense).
 */
import { getAdminDb } from "@/lib/firebase-admin";

type Sense = { lang: string; subject: string; grade: string; unit: string; def: string };

/** Firestore-safe id: no vowel points, lowercase, no slashes. */
export function curriculumWordId(word: string): string {
  return word
    .normalize("NFC")
    .replace(/[֑-ׇً-ٰٟ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\//g, "_")
    .slice(0, 120);
}

/** A prompt line naming the word's school senses, or "" when it has none. */
export async function curriculumHint(word: string): Promise<string> {
  const id = curriculumWordId(word);
  if (!id) return "";
  try {
    const snap = await getAdminDb().collection("curriculumWords").doc(id).get();
    const senses = (snap.get("senses") as Sense[] | undefined) ?? [];
    if (!senses.length) return "";
    const lines = senses
      .slice(0, 3)
      .map((s) => `- ${[s.subject, s.grade, s.unit].filter(Boolean).join(", ")}: ${s.def}`)
      .join("\n");
    return `\nSCHOOL CURRICULUM: this word is a term in school textbooks. Include each of these senses as one of the regular meanings (RULE #4e), labelled with its subject, written in the user's UI language, unless one of your meanings already says the same thing:\n${lines}`;
  } catch {
    return "";
  }
}
