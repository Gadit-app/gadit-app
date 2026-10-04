import { renderEmailHtml, renderEmailHtmlV2, mdLiteToHtml, applyName, type EmailContent } from "./render";
import { FAMILY_META, EMAIL_BASE, type FamilyEmailMeta } from "./family-content";
import { getEffectiveContent } from "./email-templates-store";

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
  build(opts: { he: boolean; unsubscribeUrl: string; firstName?: string | null }): Promise<{ subject: string; html: string }>;
};

export function renderFamilyMail(
  m: FamilyEmailMeta | undefined,
  he: boolean,
  c: EmailContent,
  opts: { unsubscribeUrl: string; firstName?: string | null },
): { subject: string; html: string } {
  // CTA links to /family by default; a feature-specific email can point at
  // its own page (e.g. /read, /say, /play) via ctaPath. he uses the /he
  // locale prefix, en is unprefixed.
  const base = he ? `${EMAIL_BASE}/he` : EMAIL_BASE;
  const link = `${base}${m?.ctaPath ?? "/family"}${m?.ctaUrlTab ?? ""}`;
  const subject = applyName(c.subject, opts.firstName);
  const body = applyName(c.body, opts.firstName);
  if (m?.v2) {
    return {
      subject,
      html: renderEmailHtmlV2({
        he,
        bodyHtml: mdLiteToHtml(he, body),
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
  async build({ he, unsubscribeUrl, firstName }) {
    const c = await getEffectiveContent(m.key, he);
    return renderFamilyMail(m, he, c, { unsubscribeUrl, firstName });
  },
}));
