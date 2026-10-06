import { INDIV_META, type IndivPlan } from "./indiv-content";
import { renderFamilyMail } from "./family-drip";
import { getEffectiveContent, hasLang } from "./email-templates-store";

/**
 * The individual Clear/Deep onboarding series (Gadi 2026-10-06). Same
 * renderer and editor store as the Family series; each email only goes to
 * the plans it lists, and its [[clear]]/[[deep]] parts follow the
 * subscriber's plan. Scheduled by the drip cron from `indivSeriesStart`.
 */
export type IndivDripMail = {
  key: string;
  dayOffset: number;
  plans: IndivPlan[];
  build(opts: { lang: string; plan: IndivPlan; unsubscribeUrl: string; firstName?: string | null; numbers?: string }): Promise<{ subject: string; html: string }>;
};

export const INDIV_DRIP: IndivDripMail[] = INDIV_META.map((m) => ({
  key: m.key,
  dayOffset: m.dayOffset,
  plans: m.plans,
  async build({ lang, plan, unsubscribeUrl, firstName, numbers }) {
    // A language with no translation of this email gets it in English.
    const use = (await hasLang(m.key, lang)) ? lang : "en";
    const c = await getEffectiveContent(m.key, use);
    return renderFamilyMail(m, use, c, { unsubscribeUrl, firstName, plan, numbers });
  },
}));
