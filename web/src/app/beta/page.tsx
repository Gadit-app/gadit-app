import type { Metadata } from "next";
import { BetaHomePage } from "./BetaHomeClient";

/**
 * /beta — V2 redesign preview.
 *
 * Renders the new dark-canvas homepage (Screen 2 from the redesign pass)
 * alongside the legacy / for side-by-side comparison. Not linked from
 * anywhere user-facing yet; we'll flip / over to this once all 11 V2
 * screens land and pass review.
 *
 * Excluded from SEO via robots.ts so neither version competes for
 * search traffic during the transition.
 */
export const metadata: Metadata = {
  title: "Gadit — V2 preview",
  robots: { index: false, follow: false },
};

export default function BetaHome() {
  return <BetaHomePage />;
}
