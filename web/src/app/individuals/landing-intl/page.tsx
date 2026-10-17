import type { Metadata } from "next";
import { individualsMetadata } from "../individuals-metadata";
import { IndividualsI18nPage } from "../IndividualsI18nPage";
import { loadIndCopy } from "../i18n";
import { resolveShareLang } from "@/lib/landing-metadata";

/**
 * /individuals/landing-intl: the real-screens Individuals page in every
 * language, for Gadi's review before it replaces the current pages
 * (2026-10-17). Not indexed.
 */
export async function generateMetadata(): Promise<Metadata> {
  return { ...(await individualsMetadata()), robots: { index: false, follow: false } };
}

export default async function IndividualsLandingNewRoute() {
  return <IndividualsI18nPage initial={await loadIndCopy(await resolveShareLang())} />;
}
