import type { Copy } from "../FamiliesLandingClient";
import type { RealCopy } from "../RealScreens";

/** Every string of the Families real-screens page in one language (2026-10-17):
 *  the shared page copy, the real-screens sections, and the few labels that
 *  were written into the page itself. Prices are placeholders ({familyMonthly},
 *  {familyYearly}, {familyUnder}, {familySave}), filled by lib/landing-i18n.ts. */
export type FamI18n = { copy: Copy; real: RealCopy; ui: { allCards: string } };
