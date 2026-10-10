import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-titles";
import { PricingPageRoute } from "./PricingClient";

/**
 * /pricing — public pricing page.
 *
 * Tier cards, monthly/yearly toggle, trust strip, FAQ. The page is
 * indexable since pricing transparency helps SEO and conversions.
 */
const BASE_METADATA: Metadata = {
  title: "Pricing, Gadit",
  description:
    "Three tiers. All with real content. Start free; upgrade when the depth helps you.",
};

/** Same metadata, with the tab title in the visitor's UI language. */
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("pricing", BASE_METADATA);
}

export default function PricingRoute() {
  return <PricingPageRoute />;
}
