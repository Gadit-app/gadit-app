import { headers, cookies } from "next/headers";
import type { Metadata } from "next";

/**
 * Per-page share metadata (Open Graph + Twitter) for the marketing
 * landing pages. Gadi 2026-08-05: sharing a landing link on WhatsApp
 * showed the HOMEPAGE pitch, because pages set only `title`/`description`
 * and never `openGraph`, so the root layout's homepage openGraph won.
 *
 * This resolves the language the same way the root layout does
 * (x-gadit-lang header from the middleware, then the gadit-lang cookie,
 * then EN), picks the page's own localized one-liner, and returns a full
 * openGraph/twitter block so the WhatsApp/social preview shows the RIGHT
 * sentence for THAT page in the shared language. The image stays the
 * per-language brand card (/og/<lang>.jpg), which reads correctly in each
 * language.
 */

// Languages that have a dedicated /og/<lang>.jpg card. Anything else
// falls back to the neutral default card.
const OG_LANGS = ["he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja", "am", "hi", "uk", "tr", "pl", "fa", "id", "nl"];

export type ShareCopy = { title: string; description: string };

export async function resolveShareLang(): Promise<string> {
  const h = await headers();
  const c = await cookies();
  const hl = h.get("x-gadit-lang");
  const cl = c.get("gadit-lang")?.value;
  return hl || cl || "en";
}

export async function shareMetadata(
  copy: Record<string, ShareCopy>,
  opts: { noindex?: boolean } = {},
): Promise<Metadata> {
  const lang = await resolveShareLang();
  const t = copy[lang] ?? copy.en;
  const ogImage = `/og/${OG_LANGS.includes(lang) ? lang : "default"}.jpg`;

  return {
    title: t.title,
    description: t.description,
    ...(opts.noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: t.title,
      description: t.description,
      siteName: "Gadit",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: t.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description,
      images: [ogImage],
    },
  };
}
