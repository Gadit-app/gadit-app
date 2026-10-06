import type { Metadata } from "next";
import { IndividualsRealLanding } from "../IndividualsRealLanding";

/**
 * /he/individuals/landing-new: the new real-screens Individuals page (Gadi
 * 2026-10-06), for review before it replaces /individuals in Hebrew. No site
 * nav, not indexed.
 */
export const metadata: Metadata = {
  title: "Gadit Individual · להבין כל מילה עד הסוף",
  robots: { index: false, follow: false },
};

export default function IndividualsLandingNewRoute() {
  return <IndividualsRealLanding />;
}
