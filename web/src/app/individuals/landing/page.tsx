import type { Metadata } from "next";
import { individualsMetadata } from "../individuals-metadata";
import { IndividualsLandingSwitch } from "../IndividualsLandingSwitch";

/**
 * /individuals/landing: the STANDALONE Individuals page, the link to send in
 * a campaign (Meta, email), like /families/landing and /schools/landing
 * (Gadi 2026-10-07). Same page as /individuals, never indexed so search
 * engines keep the in-site address.
 */

export async function generateMetadata(): Promise<Metadata> {
  return { ...(await individualsMetadata()), robots: { index: false, follow: true } };
}

export default function IndividualsLandingRoute() {
  return <IndividualsLandingSwitch />;
}
