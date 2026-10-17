/** Every string of the international Schools page (SchoolsGlobalLanding,
 *  2026-10-17): the same page as the Hebrew one, for schools outside Israel,
 *  priced in US dollars with a self-serve 14-day trial. Placeholders:
 *  {from} (the lowest monthly price), {students} (a tier's student count). */
export type SchStep = { t: string; b: string; img: string; phone?: boolean };
export type SchTool = { kicker: string; title: string; body: string; points: string[]; img: string; phone?: boolean };

export type SchCopy = {
  topCta: string; dashCta: string; credPill: string; h1: string; whatIs: string;
  heroCta: string; ctaNote: string; howCta: string; heroPoints: string[]; shotAlt: string;
  pain: { title: string; lead: string; paras: string[]; reframe: string };
  howKicker: string; howTitle: string; steps: SchStep[];
  prep: { kicker: string; title: string; body: string };
  tools: SchTool[];
  safeKicker: string; safeTitle: string; safe: string[];
  whoKicker: string; whoTitle: string; whoBody: string;
  trialKicker: string; trialTitle: string; trialItems: string[];
  priceKicker: string; priceTitle: string; priceSub: string;
  billedMonthly: string; billedYearly: string; yearlySave: string;
  upTo: string; perMonth: string; perYear: string; yearlyPerMonth: string; tierCta: string;
  includesTitle: string; includes: string[];
  larger: string; contactLink: string;
  faqKicker: string; faqTitle: string; faq: { q: string; a: string }[];
  finalTitle: string; finalBody: string; finalCta: string;
  terms: string; privacy: string;
};
