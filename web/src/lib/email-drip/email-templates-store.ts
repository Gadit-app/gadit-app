import { getAdminDb } from "@/lib/firebase-admin";
import type { EmailContent } from "./render";
import { FAMILY_CONTENT } from "./family-content";

/**
 * Firestore overrides for the editable emails. A doc at
 * emailTemplates/{key} may hold `he` and/or `en` partial content that
 * replaces the code default (family-content.ts) per field. Absent =
 * use the code default. This is what the admin email editor writes.
 */

export type StoredTemplate = {
  he?: Partial<EmailContent>;
  en?: Partial<EmailContent>;
  updatedAt?: string;
  updatedBy?: string;
};

export async function getOverride(key: string): Promise<StoredTemplate | null> {
  try {
    const doc = await getAdminDb().collection("emailTemplates").doc(key).get();
    return doc.exists ? (doc.data() as StoredTemplate) : null;
  } catch {
    return null;
  }
}

/** Code default merged with any saved override → the effective content. */
export async function getEffectiveContent(key: string, he: boolean): Promise<EmailContent> {
  const def = FAMILY_CONTENT[key];
  const base = he ? def.he : def.en;
  const ov = await getOverride(key);
  const o = he ? ov?.he : ov?.en;
  return {
    subject: o?.subject ?? base.subject,
    heading: o?.heading ?? base.heading,
    body: o?.body ?? base.body,
    ctaText: o?.ctaText ?? base.ctaText,
  };
}

export async function saveOverride(key: string, lang: "he" | "en", content: EmailContent): Promise<void> {
  await getAdminDb()
    .collection("emailTemplates")
    .doc(key)
    .set({ [lang]: content, updatedAt: new Date().toISOString() }, { merge: true });
}

/** Revert one language back to the code default. */
export async function resetOverride(key: string, lang: "he" | "en"): Promise<void> {
  const { FieldValue } = await import("firebase-admin/firestore");
  await getAdminDb()
    .collection("emailTemplates")
    .doc(key)
    .set({ [lang]: FieldValue.delete(), updatedAt: new Date().toISOString() }, { merge: true });
}
