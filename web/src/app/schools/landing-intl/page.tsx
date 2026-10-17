import type { Metadata } from "next";
import { SchoolsI18nPage } from "../SchoolsI18nPage";
import { loadSchCopy } from "../i18n";
import { resolveShareLang, shareMetadata } from "@/lib/landing-metadata";
import { SCHOOLS_OG } from "../page";

/**
 * /schools/landing-intl: the international Schools page in every language but
 * Hebrew (Hebrew shows the Israeli page), for Gadi's review before it
 * replaces the current pages (2026-10-17). Not indexed.
 */
export function generateMetadata(): Promise<Metadata> {
  return shareMetadata(SCHOOLS_OG, { noindex: true });
}

export default async function SchoolsLandingNewRoute() {
  const lang = await resolveShareLang();
  return <SchoolsI18nPage initial={await loadSchCopy(lang === "he" ? "en" : lang)} />;
}
