export type IndStep = { t: string; b: string; img: string; /** Small line under the title, like the Families steps (Gadi 2026-10-19). */ s?: string };
export type IndTool = { kicker: string; title: string; body: string; points: string[]; img: string; img2?: string };
export type IndMiniTool = { kicker: string; title: string; body: string; img: string };


/** Every string of the Individuals real-screens page. Prices are placeholders
 *  ({monthly}, {yearly}, {familyMonthly}) filled by lib/landing-i18n.ts. */
export type IndCopy = {
  topCta: string; credPill: string; h1: string; whatIs: string; heroCta: string; ctaNote: string; howCta: string;
  heroPoints: string[]; shotAlt: string;
  /** Phone, tablet, computer under the hero text (Gadi 2026-10-19). */
  devices?: [string, string, string];
  pain: { title: string; lead: string; paras: string[]; reframe: string };
  whoKicker: string; whoTitle: string; who: { t: string; b: string }[];
  howKicker: string; howTitle: string; steps: IndStep[]; stepsCta: string;
  photo: IndTool;
  moreKicker: string; moreTitle: string; more: IndMiniTool[];
  priceKicker: string; priceTitle: string; monthly: string; yearlyLine: string; bothTrial: string; includes: string[];
  priceCta: string; priceTerms: string; freeLink: string; familyNote: string; familyLink: string;
  faqKicker: string; faqTitle: string; faq: { q: string; a: string }[];
  finalTitle: string; finalBody: string; finalCta: string;
  terms: string; privacy: string;
};
