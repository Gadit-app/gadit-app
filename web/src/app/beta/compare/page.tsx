import type { Metadata } from "next";
import { BetaComparePage } from "./BetaCompareClient";

/**
 * /beta/compare — V2 compare-words screen.
 *
 * Same robots-disallowed posture as the rest of /beta. Page is a thin
 * shell around CompareV2; the legacy /compare keeps serving production.
 */
export const metadata: Metadata = {
  title: "Compare — Gadit",
  robots: { index: false, follow: false },
};

export default function BetaCompare() {
  return <BetaComparePage />;
}
