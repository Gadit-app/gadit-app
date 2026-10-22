import type { DocumentReference } from "firebase-admin/firestore";
import type { LearnLang, Reads } from "./engine";

/**
 * "What are you learning, and do you already read it?" written to
 * users/{uid}.learn: lang, reads, and where the hidden pointer starts for a
 * language picked for the first time. One writer for the child's own setup
 * (POST /api/learn "setup") and the parent's dashboard setting
 * (POST /api/family/child-learn, 2026-10-22), so both write the same fields.
 */
export async function setupLearn(ref: DocumentReference, lang: LearnLang | null, reads: Reads): Promise<void> {
  const doc = ((await ref.get()).get("learn") as { d?: Partial<Record<LearnLang, number>> } | undefined) ?? {};
  const d = { ...(doc.d ?? {}) };
  // Where the hidden pointer starts: a child who reads starts a step up.
  if (lang && d[lang] == null) d[lang] = reads === "yes" ? 2 : reads === "little" ? 1.5 : 1;
  await ref.set({ learn: { lang, reads, d } }, { merge: true });
}
