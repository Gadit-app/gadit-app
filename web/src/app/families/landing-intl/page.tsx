import type { Metadata } from "next";
import { Suspense } from "react";
import { FamiliesI18nPage } from "../FamiliesI18nPage";
import { loadFamI18n } from "../i18n";
import { resolveShareLang, shareMetadata } from "@/lib/landing-metadata";
import { FAMILIES_OG } from "../page";

/**
 * /families/landing-intl: the real-screens Families page in every language,
 * for Gadi's review before it replaces the current pages (2026-10-17).
 * Hebrew shows the Hebrew page as it is. Not indexed.
 */
export function generateMetadata(): Promise<Metadata> {
  return shareMetadata(FAMILIES_OG, { noindex: true });
}

export default async function FamiliesLandingNewRoute() {
  const lang = await resolveShareLang();
  const initial = await loadFamI18n(lang === "he" ? "en" : lang);
  return (
    <Suspense fallback={null}>
      <FamiliesI18nPage initial={initial} />
    </Suspense>
  );
}
