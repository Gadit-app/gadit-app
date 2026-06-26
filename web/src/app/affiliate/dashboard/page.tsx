import type { Metadata } from "next";
import { DashboardPage } from "./DashboardClient";

/**
 * /affiliate/dashboard — embedded Affonso partner dashboard for
 * signed-in Gadit users. Server endpoint at /api/affiliate/embed-token
 * mints a short-lived publicToken; this page pastes it into the
 * Affonso iframe.
 *
 * noindex so search engines don't try to crawl what would always be
 * a login-walled URL. The page itself prompts login for anonymous
 * visitors via the auth context.
 */
export const metadata: Metadata = {
  title: "Affiliate Dashboard, Gadit",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <DashboardPage />;
}
