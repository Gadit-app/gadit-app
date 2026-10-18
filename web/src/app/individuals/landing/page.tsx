import type { Metadata } from "next";
import { individualsMetadata } from "../individuals-metadata";
import { IndividualsI18nPage } from "../IndividualsI18nPage";
import { loadIndCopy } from "../i18n";
import { resolveShareLang } from "@/lib/landing-metadata";

/**
 * /individuals/landing: the STANDALONE Individuals page, the link to send in
 * a campaign (Meta, email), like /families/landing and /schools/landing
 * (Gadi 2026-10-07). Same page as /individuals, never indexed so search
 * engines keep the in-site address.
 */

export async function generateMetadata(): Promise<Metadata> {
  return { ...(await individualsMetadata()), robots: { index: false, follow: true } };
}

// The real-screens page in every language (Gadi approved replacing the old
// pages, 2026-10-18). Hebrew renders as before.
export default async function IndividualsLandingRoute() {
  return <IndividualsI18nPage initial={await loadIndCopy(await resolveShareLang())} />;
}
