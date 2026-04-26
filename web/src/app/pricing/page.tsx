import type { Metadata } from "next";
import { PricingPageRoute } from "./PricingClient";

/**
 * /pricing — public pricing page.
 *
 * Tier cards, monthly/yearly toggle, trust strip, FAQ. The page is
 * indexable since pricing transparency helps SEO and conversions.
 */
export const metadata: Metadata = {
  title: "Pricing — Gadit",
  description:
    "Three tiers. All with real content. Start free; upgrade when the depth helps you.",
};

export default function PricingRoute() {
  return <PricingPageRoute />;
}
