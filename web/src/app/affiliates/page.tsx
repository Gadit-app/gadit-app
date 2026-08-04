import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * /affiliates — RETIRED, forwards to /partners.
 *
 * The old Affonso-hosted affiliate marketing page. Superseded by the
 * in-house partner program marketing page at /partners. Keeps the
 * language prefix so /he/affiliates lands on /he/partners.
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
