"use client";

import { SchoolsGlobalLanding } from "./SchoolsGlobalLanding";
import { SchoolsRealLanding } from "./SchoolsRealLanding";
import { SCH_LOADERS } from "./i18n";
import type { SchCopy } from "./i18n/types";
import { useLandingCopy } from "@/lib/landing-i18n-client";
import { useLang } from "@/lib/lang-context";

/** Hebrew and Arabic: the Israeli page (Arabic since 2026-11-09, Arab schools
 *  are Israeli schools). Every other language: the international page (2026-10-17). */
export function SchoolsI18nPage({ initial }: { initial: { lang: string; copy: SchCopy } }) {
  const { lang: ui } = useLang();
  const { lang, copy } = useLandingCopy(SCH_LOADERS, initial);
  return ui === "he" || ui === "ar" ? <SchoolsRealLanding lang={ui} /> : <SchoolsGlobalLanding copy={copy} lang={lang} />;
}
