import type { Metadata } from "next";
import { ComparePage } from "./CompareClient";

/**
 * /compare — confusable-word comparison screen (Deep tier).
 *
 * Indexed: false. Even though the comparison results are useful
 * content, they're AI-generated on-demand and cached per-pair, so the
 * SEO value is low and we'd rather keep crawl budget on the homepage
 * + pricing.
 */
export const metadata: Metadata = {
  title: "Compare — Gadit",
  robots: { index: false, follow: false },
};

export default function CompareRoute() {
  return <ComparePage />;
}
