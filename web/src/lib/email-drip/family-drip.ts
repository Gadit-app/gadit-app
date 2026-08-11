import { renderEmailHtml, mdLiteToHtml } from "./render";
import { FAMILY_META, EMAIL_BASE } from "./family-content";
import { getEffectiveContent } from "./email-templates-store";

/**
 * Family onboarding email series. Fires AFTER a Family subscription
 * activates (keyed on the user doc's `familyActivatedAt`), separate from
 * the general signup drip: connect the kids, turn on alerts, how it works.
 *
 * Content lives in family-content.ts (markdown-lite) and can be edited in
 * the admin email editor (overrides in Firestore). build() renders the
 * effective content (override merged over default) through the shared
 * renderer, so it's async.
 */

export type FamilyDripMail = {
  key: string;
  dayOffset: number;
  build(opts: { he: boolean; unsubscribeUrl: string }): Promise<{ subject: string; html: string }>;
};

export const FAMILY_DRIP: FamilyDripMail[] = FAMILY_META.map((m) => ({
  key: m.key,
  dayOffset: m.dayOffset,
  async build({ he, unsubscribeUrl }) {
    const c = await getEffectiveContent(m.key, he);
    const link = (he ? `${EMAIL_BASE}/he/family` : `${EMAIL_BASE}/family`) + m.ctaUrlTab;
    const html = renderEmailHtml({
      he,
      eyebrow: he ? m.eyebrow.he : m.eyebrow.en,
      heading: c.heading,
      bodyHtml: mdLiteToHtml(he, c.body),
      ctaText: c.ctaText,
      ctaUrl: link,
      foot: he ? m.foot.he : m.foot.en,
      unsubscribeUrl,
    });
    return { subject: c.subject, html };
  },
}));
