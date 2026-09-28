import type { Metadata } from "next";
import { Suspense } from "react";
import FamiliesLandingClient from "../FamiliesLandingClient";
import { shareMetadata } from "@/lib/landing-metadata";
import { FAMILIES_OG } from "../page";

/**
 * /families/landing-2 — the new real-screens campaign page (Gadi 2026-09-28).
 * Same page as /families/landing (which now also shows it); this alias exists
 * so campaigns can link the new version explicitly. No site nav.
 */
export function generateMetadata(): Promise<Metadata> {
  return shareMetadata(FAMILIES_OG, { noindex: true });
}

export default function FamiliesLanding2Route() {
  return (
    <Suspense fallback={null}>
      <FamiliesLandingClient />
    </Suspense>
  );
}
