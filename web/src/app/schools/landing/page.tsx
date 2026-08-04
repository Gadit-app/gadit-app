import type { Metadata } from "next";
import { SchoolsLandingClient } from "../SchoolsLandingClient";
import { shareMetadata } from "@/lib/landing-metadata";
import { SCHOOLS_OG } from "../page";

/**
 * /schools/landing — the STANDALONE Schools landing page, with NO site nav
 * (Gadi 2026-07-29). The link to send in a campaign so it reads as a single
 * product page. The in-site version (with nav) is at /schools.
 */
export function generateMetadata(): Promise<Metadata> {
  return shareMetadata(SCHOOLS_OG, { noindex: true });
}

export default function SchoolsLandingRoute() {
  return <SchoolsLandingClient standalone />;
}
