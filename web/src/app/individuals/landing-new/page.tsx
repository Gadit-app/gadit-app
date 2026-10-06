import type { Metadata } from "next";
import { IndividualsRealLanding } from "../IndividualsRealLanding";

/**
 * /he/individuals/landing-new: the new real-screens Individuals page (Gadi
 * 2026-10-06), for review before it replaces /individuals in Hebrew. No site
 * nav, not indexed.
 */
export const metadata: Metadata = {
  title: "Gadit Individual · להבין כל מילה עד הסוף",
  description: "כל המשמעויות של כל מילה, עם דוגמאות, תמונה ומקור המילה, ומחברת שזוכרת כל מילה. 14 יום ניסיון חינם.",
  robots: { index: false, follow: false },
};

export default function IndividualsLandingNewRoute() {
  return <IndividualsRealLanding />;
}
