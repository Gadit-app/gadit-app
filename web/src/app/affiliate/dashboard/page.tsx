import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * /affiliate/dashboard — RETIRED.
 *
 * This used to embed the Affonso partner dashboard. Gadit now runs its
 * own in-house partner program (/partners signup, /partner/dashboard),
 * so this legacy URL permanently forwards there. The language prefix
 * from the middleware (x-gadit-lang) is preserved so /he/affiliate/...
 * lands on /he/partners.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function Page() {
  const h = await headers();
  const lang = h.get("x-gadit-lang");
  const prefix = lang && lang !== "en" ? `/${lang}` : "";
  redirect(`${prefix}/partners`);
}
