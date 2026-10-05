import type { Metadata } from "next";
import { SchoolsRealLanding } from "../SchoolsRealLanding";
import { shareMetadata } from "@/lib/landing-metadata";
import { SCHOOLS_OG } from "../page";

/**
 * /he/schools/landing-new: the new real-screens Schools page (Gadi
 * 2026-10-05), for review before it replaces /schools/landing. Hebrew only,
 * no site nav, not indexed.
 */
export function generateMetadata(): Promise<Metadata> {
  return shareMetadata(SCHOOLS_OG, { noindex: true });
}

export default function SchoolsLandingNewRoute() {
  return <SchoolsRealLanding />;
}
