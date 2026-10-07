import type { Metadata } from "next";
import { IndividualsLandingSwitch } from "../IndividualsLandingSwitch";

/**
 * /individuals/landing: the STANDALONE Individuals page, the link to send in
 * a campaign (Meta, email), like /families/landing and /schools/landing
 * (Gadi 2026-10-07). Same page as /individuals, never indexed so search
 * engines keep the in-site address.
 */
export const metadata: Metadata = {
  title: "Gadit Individual · להבין כל מילה עד הסוף",
  description: "כל המשמעויות של כל מילה, עם דוגמאות, תמונה ומקור המילה, ומחברת שזוכרת כל מילה. 14 יום ניסיון חינם.",
  robots: { index: false, follow: true },
};

export default function IndividualsLandingRoute() {
  return <IndividualsLandingSwitch />;
}
