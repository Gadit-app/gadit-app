import type { Lang } from "@/lib/i18n";

/**
 * Data-driven drip content for the 33-language path (Gadi 2026-08-23).
 *
 * The original en/he drip stays in mail-*-{en,he}.ts (untouched). Every OTHER
 * language lives here as data and is rendered by build-i18n-drip.ts through the
 * shared i18n-layout. A language is only "live" once it appears in DRIP_CONTENT;
 * until then getDripForLang() falls back to the English drip.
 *
 * Emails 2 (meanings) and 3 (etymology) are authored per language around a rich,
 * polysemous word native to that language (like he uses רוח, en uses "spirit"),
 * NOT translated. `exampleWord` is that word, used to link the meanings CTA.
 * Etymology must be accurate (reviewed).
 */

export type DripEmail = {
  subject: string;
  preheader: string;
  /** Body paragraphs, WITHOUT the greeting (the builder prepends it). Plain
   *  text with entities allowed; each becomes its own <p>. */
  paras: string[];
  /** CTA button label. */
  cta: string;
  /** meanings/etymology only: the language's chosen example word (links the CTA). */
  exampleWord?: string;
  /** Optional small gray P.S. line (meanings has one). */
  ps?: string;
  /** Optional signature lines (welcome). Last line renders small/gray (the title). */
  signOff?: string[];
};

export type LangDrip = {
  /** Greeting with a {name} placeholder, e.g. "Hi {name}," */
  greetNamed: string;
  /** Greeting with no name, e.g. "Hi," */
  greetPlain: string;
  /** Localized: "You're receiving this because you signed up for Gadit." */
  footerReason: string;
  /** Localized "Unsubscribe". */
  unsubscribeLabel: string;
  welcome: DripEmail;
  meanings: DripEmail;
  etymology: DripEmail;
  visual: DripEmail;
  summary: DripEmail;
};

/** Per-language drip content. Filled in reviewed waves. en/he are NOT here (they
 *  keep using their original files). */
export const DRIP_CONTENT: Partial<Record<Lang, LangDrip>> = {
  // populated per language wave
};
