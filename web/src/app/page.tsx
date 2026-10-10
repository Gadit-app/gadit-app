import type { Metadata } from "next";
import { resolveShareLang } from "@/lib/landing-metadata";
import { HomePage } from "./HomeClient";

/**
 * / — Gadit homepage.
 *
 * Dark navy canvas, hero with the search-as-CTA, value props, tier
 * teaser, footer. Anonymous and signed-in users both land here.
 */
const EN_METADATA: Metadata = {
  title: "Gadit, Every word, understood.",
  description:
    "A dictionary that meets you in context, meanings, origins, idioms, and a vivid image, in 30+ languages.",
};

/** English keeps its own homepage line; every other UI language inherits the
 *  root layout's localized title and description (2026-10-10 i18n sweep). */
export async function generateMetadata(): Promise<Metadata> {
  return (await resolveShareLang()) === "en" ? EN_METADATA : {};
}

export default function Home() {
  return <HomePage />;
}
