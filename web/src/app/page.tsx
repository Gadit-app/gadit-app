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
  title: "Gadit, Every word, understood",
  description:
    "A dictionary that meets you in context, meanings, origins, idioms, and a vivid image, in 30+ languages.",
};

/** English keeps its own homepage line; every other UI language inherits the
 *  root layout's localized title and description (2026-10-10 i18n sweep). */
export async function generateMetadata(): Promise<Metadata> {
  return (await resolveShareLang()) === "en" ? EN_METADATA : {};
}

/** Who Gadit is, for search engines (Gadi 2026-11-17, SEO audit): the
 *  site's name and logo. Same in every language. */
const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.gadit.app/#organization",
      name: "Gadit",
      url: "https://www.gadit.app/",
      logo: { "@type": "ImageObject", url: "https://www.gadit.app/icon-512.png", width: 512, height: 512 },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.gadit.app/#website",
      name: "Gadit",
      alternateName: "gadit.app",
      url: "https://www.gadit.app/",
      publisher: { "@id": "https://www.gadit.app/#organization" },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD).replace(/</g, "\\u003c") }}
      />
      <HomePage />
    </>
  );
}
