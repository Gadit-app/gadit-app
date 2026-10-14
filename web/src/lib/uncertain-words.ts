/**
 * Words the model said it is not sure about instead of guessing a meaning
 * (Gadi 2026-10-14). One doc per (lang, word) in `uncertainWords`, with a
 * count and the last time, so they can be reviewed and fixed by hand.
 */
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";

export async function noteUncertainWord(word: string, lang: string): Promise<void> {
  try {
    const id = `${lang}_${word}`.slice(0, 300).replace(/\//g, "_");
    await getAdminDb().collection("uncertainWords").doc(id).set(
      { word, lang, count: FieldValue.increment(1), lastAt: new Date().toISOString() },
      { merge: true },
    );
  } catch { /* best-effort */ }
}
