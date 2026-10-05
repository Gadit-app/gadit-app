import { renderEmailHtml, renderEmailHtmlV2, mdLiteToHtml, applyName, type EmailContent } from "./render";
import { FAMILY_META, EMAIL_BASE, type FamilyEmailMeta } from "./family-content";
import { getEffectiveContent, hasLang } from "./email-templates-store";
import { fillChildren, sampleChildrenSummary } from "./family-summary";

/**
 * Family onboarding email series. Fires AFTER a Family subscription
 * activates (keyed on the user doc's `familyActivatedAt`), separate from
 * the general signup drip.
 *
 * Content lives in family-content.ts (markdown-lite) and can be edited in
 * the admin email editor (overrides in Firestore). build() renders the
 * effective content (override merged over default) through the shared
 * renderer, so it's async. renderFamilyMail is also what the admin preview
 * and test-send use, so what Gadi previews is exactly what goes out.
 */

export type FamilyDripMail = {
  key: string;
  dayOffset: number;
  /** `lang` (any UI language) wins over `he`; untranslated → English. */
  build(opts: { he: boolean; lang?: string; unsubscribeUrl: string; firstName?: string | null; childrenSummary?: string }): Promise<{ subject: string; html: string }>;
};

export function renderFamilyMail(
  m: FamilyEmailMeta | undefined,
  heOrLang: boolean | string,
  c: EmailContent,
  opts: { unsubscribeUrl: string; firstName?: string | null; childrenSummary?: string },
): { subject: string; html: string } {
  const lang = heOrLang === true ? "he" : heOrLang === false ? "en" : heOrLang;
  const he = lang === "he";
  // CTA links to /family by default; a feature-specific email can point at
  // its own page (e.g. /read, /say, /play) via ctaPath. he uses the /he
  // locale prefix, en is unprefixed.
  const base = lang === "en" ? EMAIL_BASE : `${EMAIL_BASE}/${lang}`;
  const link = `${base}${m?.ctaPath ?? "/family"}${m?.ctaUrlTab ?? ""}`;
  const subject = applyName(c.subject, opts.firstName);
  // {ילדים}/{children}: each child's numbers (real on send, a sample in the
  // editor preview and test sends).
  const body = fillChildren(applyName(c.body, opts.firstName), opts.childrenSummary ?? sampleChildrenSummary(lang));
  if (m?.v2) {
    return {
      subject,
      html: renderEmailHtmlV2({
        he,
        lang,
        bodyHtml: mdLiteToHtml(lang, body),
        ctaText: c.ctaText,
        ctaUrl: link,
        next: c.next,
        closing: c.closing,
        signature: c.signature,
        helpText: c.helpText,
        helpUrl: `${base}/help`,
        unsubscribeUrl: opts.unsubscribeUrl,
      }),
    };
  }
  return {
    subject,
    html: renderEmailHtml({
      he,
      eyebrow: he ? m?.eyebrow?.he ?? "" : m?.eyebrow?.en ?? "",
      heading: c.heading,
      bodyHtml: mdLiteToHtml(he, body),
      ctaText: c.ctaText,
      ctaUrl: link,
      foot: he ? m?.foot?.he ?? "" : m?.foot?.en ?? "",
      unsubscribeUrl: opts.unsubscribeUrl,
    }),
  };
}

export const FAMILY_DRIP: FamilyDripMail[] = FAMILY_META.map((m) => ({
  key: m.key,
  dayOffset: m.dayOffset,
  async build({ he, lang, unsubscribeUrl, firstName, childrenSummary }) {
    // A language with no translation of this email gets it in English.
    const want = lang ?? (he ? "he" : "en");
    const use = (await hasLang(m.key, want)) ? want : "en";
    const c = await getEffectiveContent(m.key, use);
    return renderFamilyMail(m, use, c, { unsubscribeUrl, firstName, childrenSummary });
  },
}));
