import type { Metadata } from "next";
import { Suspense } from "react";
import FamiliesLandingClient from "../FamiliesLandingClient";
import { shareMetadata } from "@/lib/landing-metadata";
import { FAMILIES_OG } from "../page";

/**
 * /families/landing — the STANDALONE Families landing page, with NO site
 * nav (Gadi 2026-07-29). This is the link to send in a campaign (Meta,
 * email) so it reads as a single product page, without the whole-site menu
 * confusing a cold visitor. The in-site version (with nav) is at /families.
 */
export function generateMetadata(): Promise<Metadata> {
  return shareMetadata(FAMILIES_OG, { noindex: true });
}

export default function FamiliesLandingRoute() {
  return (
    <Suspense fallback={null}>
      <FamiliesLandingClient />
    </Suspense>
  );
}
