"use client";

import { IndividualsRealLanding } from "./IndividualsRealLanding";
import { IND_LOADERS } from "./i18n";
import type { IndCopy } from "./i18n/types";
import { useLandingCopy } from "@/lib/landing-i18n-client";

/** The Individuals real-screens page in the visitor's language (2026-10-17). */
export function IndividualsI18nPage({ initial }: { initial: { lang: string; copy: IndCopy } }) {
  const { lang, copy } = useLandingCopy(IND_LOADERS, initial);
  return <IndividualsRealLanding copy={copy} lang={lang} />;
}
