import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-titles";
import { ComparePage } from "./CompareClient";

/**
 * /compare — confusable-word comparison screen (Deep tier).
 *
 * Indexed: false. Even though the comparison results are useful
 * content, they're AI-generated on-demand and cached per-pair, so the
 * SEO value is low and we'd rather keep crawl budget on the homepage
 * + pricing.
 */
const BASE_METADATA: Metadata = {
  title: "Compare, Gadit",
  robots: { index: false, follow: false },
};

/** Same metadata, with the tab title in the visitor's UI language. */
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("compare", BASE_METADATA);
}

export default function CompareRoute() {
  return <ComparePage />;
}
