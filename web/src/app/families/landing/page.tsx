import type { Metadata } from "next";
import { Suspense } from "react";
import { FamiliesI18nPage } from "../FamiliesI18nPage";
import { loadFamI18n } from "../i18n";
import { resolveShareLang } from "@/lib/landing-metadata";
import { shareMetadata } from "@/lib/landing-metadata";
import { FAMILIES_OG } from "../page";

/**
 * /families/landing — the STANDALONE Families landing page, with NO site
 * nav (Gadi 2026-07-29). This is the link to send in a campaign (Meta,
 * email) so it reads as a single product page, without the whole-site menu
 * confusing a cold visitor. The in-site version (with nav) is at /families.
 */
export function generateMetadata(): Promise<Metadata> {
  return shareMetadata(FAMILIES_OG, { noindex: true });
}

// The real-screens page in every language (Gadi approved replacing the old
// pages, 2026-10-18). Hebrew renders as before.
export default async function FamiliesLandingRoute() {
  const lang = await resolveShareLang();
  const initial = await loadFamI18n(lang === "he" ? "en" : lang);
  return (
    <Suspense fallback={null}>
      <FamiliesI18nPage initial={initial} />
    </Suspense>
  );
}
