import type { Metadata } from "next";
import { SchoolsLandingClient } from "../SchoolsLandingClient";
import { shareMetadata } from "@/lib/landing-metadata";
import { SCHOOLS_OG } from "../page";

/**
 * /schools/landing-old: the previous illustrated Schools page, kept after
 * the new real-screens Hebrew page replaced it (Gadi 2026-10-06).
 */
export function generateMetadata(): Promise<Metadata> {
  return shareMetadata(SCHOOLS_OG, { noindex: true });
}

export default function SchoolsLandingOldRoute() {
  return <SchoolsLandingClient standalone />;
}
