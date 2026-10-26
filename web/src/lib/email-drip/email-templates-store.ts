import { getAdminDb } from "@/lib/firebase-admin";
import { v2Defaults, type EmailContent } from "./render";
import { FAMILY_CONTENT } from "./family-content";
import { INDIV_CONTENT } from "./indiv-content";
import { RECOVERY_CONTENT, RECOVERY_I18N } from "./checkout-recovery-content";
import { ACTIVATION_CONTENT, ACTIVATION_I18N } from "./activation-content";
import { SUBJECTS_SERIES_I18N } from "./subjects-content";

// Every editable series shares one store: Family + individual Clear/Deep +
// checkout recovery and activation (2026-10-21).
const CONTENT: Record<string, { he: EmailContent; en: EmailContent }> = { ...FAMILY_CONTENT, ...INDIV_CONTENT, ...RECOVERY_CONTENT, ...ACTIVATION_CONTENT };

// Code translations into the other UI languages (2026-10-22): recovery and
// activation, from email-drip/i18n/<lang>.json. The default for a language
// before anyone saves a translation in the editor. The two "key words by
// subject" series emails carry German in code (2026-10-26).
const CODE_I18N: Record<string, Partial<Record<string, EmailContent>>> = { ...RECOVERY_I18N, ...ACTIVATION_I18N, ...SUBJECTS_SERIES_I18N };

/** The code translation of an email into a language (not he / en), if any. */
export function codeTranslation(key: string, lang: string): EmailContent | undefined {
  return CODE_I18N[key]?.[lang];
}

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
 *  `he` true/false is Hebrew/English; a language code picks that language.
 *  Any other language, per field: the translation saved in the editor
 *  (Firestore), then the code translation (i18n/<lang>.json), then English.
 *  A language with neither gets the English email (with its English edits). */
export async function getEffectiveContent(key: string, he: boolean | string): Promise<EmailContent> {
  const lang = he === true ? "he" : he === false ? "en" : he;
  const def = CONTENT[key];
  const ov = await getOverride(key);
  const other = lang !== "he" && lang !== "en";
  const own = other ? block(ov, lang) : undefined;
  const code = other ? codeTranslation(key, lang) : undefined;
  const useLang = lang === "he" ? "he" : own || code ? lang : "en";
  const base = useLang === "he" ? def.he : code ?? def.en;
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

/** Has this email been translated into `lang` (he/en always count), in the
 *  editor (Firestore) or in code? Senders render in `lang` when true (the
 *  direction follows it), else in English. */
export async function hasLang(key: string, lang: string): Promise<boolean> {
  if (lang === "he" || lang === "en") return true;
  if (codeTranslation(key, lang)) return true;
  return !!block(await getOverride(key), lang);
}

/** Is a translation into `lang` saved in the editor (Firestore)? */
export async function hasOverride(key: string, lang: string): Promise<boolean> {
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
