import type { Metadata } from "next";
import { individualsMetadata } from "./individuals-metadata";
import { IndividualsI18nPage } from "./IndividualsI18nPage";
import { loadIndCopy } from "./i18n";
import { resolveShareLang } from "@/lib/landing-metadata";

export function generateMetadata(): Promise<Metadata> {
  return individualsMetadata();
}

// The real-screens page in every language (Gadi approved replacing the old
// pages, 2026-10-18). Hebrew renders as before.
export default async function Page() {
  return <IndividualsI18nPage initial={await loadIndCopy(await resolveShareLang())} />;
}
