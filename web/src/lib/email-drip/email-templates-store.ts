import { getAdminDb } from "@/lib/firebase-admin";
import { v2Defaults, type EmailContent } from "./render";
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
  /** Other UI languages (ar, ru, ...): translations, saved whole. */
  [lang: string]: Partial<EmailContent> | string | undefined;
  updatedAt?: string;
  updatedBy?: string;
};
const block = (ov: StoredTemplate | null, lang: string) => {
  const b = ov?.[lang];
  return b && typeof b === "object" ? (b as Partial<EmailContent>) : undefined;
};

export async function getOverride(key: string): Promise<StoredTemplate | null> {
  try {
    const doc = await getAdminDb().collection("emailTemplates").doc(key).get();
    return doc.exists ? (doc.data() as StoredTemplate) : null;
  } catch {
    return null;
  }
}

/** Code default merged with any saved override → the effective content.
 *  `he` true/false is Hebrew/English; a language code picks that language,
 *  and a language with no translation yet gets the English email. */
export async function getEffectiveContent(key: string, he: boolean | string): Promise<EmailContent> {
  const lang = he === true ? "he" : he === false ? "en" : he;
  const def = FAMILY_CONTENT[key];
  const ov = await getOverride(key);
  const own = lang !== "he" && lang !== "en" ? block(ov, lang) : undefined;
  const useLang = lang === "he" ? "he" : own ? lang : "en";
  const base = useLang === "he" ? def.he : def.en;
  const o = useLang === "he" || useLang === "en" ? block(ov, useLang) : own;
  const D = v2Defaults(useLang);
  return {
    subject: o?.subject ?? base.subject,
    heading: o?.heading ?? base.heading,
    body: o?.body ?? base.body,
    ctaText: o?.ctaText ?? base.ctaText,
    next: o?.next ?? base.next,
    closing: o?.closing ?? base.closing ?? D.closing,
    signature: o?.signature ?? base.signature ?? D.signature,
    helpText: o?.helpText ?? base.helpText ?? D.helpText,
  };
}

/** Has this email been translated into `lang` (he/en always count)? */
export async function hasLang(key: string, lang: string): Promise<boolean> {
  if (lang === "he" || lang === "en") return true;
  return !!block(await getOverride(key), lang);
}

export async function saveOverride(key: string, lang: string, content: EmailContent): Promise<void> {
  await getAdminDb()
    .collection("emailTemplates")
    .doc(key)
    .set({ [lang]: content, updatedAt: new Date().toISOString() }, { merge: true });
}

/** Revert one language back to the code default. */
export async function resetOverride(key: string, lang: string): Promise<void> {
  const { FieldValue } = await import("firebase-admin/firestore");
  await getAdminDb()
    .collection("emailTemplates")
    .doc(key)
    .set({ [lang]: FieldValue.delete(), updatedAt: new Date().toISOString() }, { merge: true });
}
