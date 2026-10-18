import type { Metadata } from "next";
import { SchoolsI18nPage } from "../SchoolsI18nPage";
import { loadSchCopy } from "../i18n";
import { resolveShareLang } from "@/lib/landing-metadata";
import { shareMetadata } from "@/lib/landing-metadata";
import { SCHOOLS_OG } from "../page";

/**
 * /schools/landing — the STANDALONE Schools landing page, with NO site nav
 * (Gadi 2026-07-29). The link to send in a campaign so it reads as a single
 * product page. The in-site version (with nav) is at /schools.
 */
export function generateMetadata(): Promise<Metadata> {
  return shareMetadata(SCHOOLS_OG, { noindex: true });
}

// The real-screens page in every language (Gadi approved replacing the old
// pages, 2026-10-18). Hebrew renders as before.
export default async function SchoolsLandingRoute() {
  const lang = await resolveShareLang();
  return <SchoolsI18nPage initial={await loadSchCopy(lang === "he" ? "en" : lang)} />;
}
