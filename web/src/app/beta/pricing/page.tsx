import type { Metadata } from "next";
import { BetaPricingPage } from "./BetaPricingClient";

/**
 * /beta/pricing — V2 pricing page (Screen 3 from the redesign pass).
 *
 * Mirrors /pricing semantically but renders against the dark navy
 * stage with the new tier cards, trust strip, and FAQ accordion.
 * Robots-disallowed via robots.ts so it doesn't compete with /pricing
 * during the transition.
 */
export const metadata: Metadata = {
  title: "Pricing — Gadit",
  robots: { index: false, follow: false },
};

export default function BetaPricing() {
  return <BetaPricingPage />;
}
