import type { Metadata } from "next";
import { AffiliatesPage } from "./AffiliatesClient";

/**
 * /affiliates — public marketing page for the Gadit Partner Program.
 *
 * Mission-led copy: leads with "help people in the world understand
 * words to the end" and converts that into recurring income. The
 * commission detail (30% × 12 months on monthly, 15% one-time on
 * yearly, 60-day cookie) follows the program we configured in Affonso.
 *
 * Every CTA on this page routes to the Affonso-hosted portal
 * (https://gaditapp.affonso.io) — that's where signup, dashboard,
 * coupon codes, and payouts live. Embedding the portal in-app is a
 * future iteration; for V1 the marketing page introduces the program
 * and the portal handles the actual mechanics.
 */
export const metadata: Metadata = {
  title: "Gadit, Affiliate Program",
  description:
    "Help people around the world understand words deeply, earn 30% recurring commission for 12 months on every paid Gadit subscription you refer.",
  openGraph: {
    title: "Gadit, Affiliate Program",
    description:
      "Help people around the world understand words deeply, earn 30% recurring commission for 12 months on every paid subscription you refer.",
  },
};

export default function Page() {
  return <AffiliatesPage />;
}
