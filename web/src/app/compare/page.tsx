import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * /compare: RETIRED (Gadi 2026-10-19), the compare-words tool is no longer
 * part of Gadit. Old links land on the home page, language prefix kept.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function Page() {
  const h = await headers();
  const lang = h.get("x-gadit-lang");
  redirect(lang && lang !== "en" ? `/${lang}` : "/");
}
