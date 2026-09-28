import type { Metadata } from "next";
import { Suspense } from "react";
import FamiliesLandingClient from "../FamiliesLandingClient";
import { shareMetadata } from "@/lib/landing-metadata";
import { FAMILIES_OG } from "../page";

/**
 * /families/landing-old — the previous illustrated Families campaign page,
 * kept as a backup after the real-screens rebuild (Gadi 2026-09-28). No nav.
 */
export function generateMetadata(): Promise<Metadata> {
  return shareMetadata(FAMILIES_OG, { noindex: true });
}

export default function FamiliesLandingOldRoute() {
  return (
    <Suspense fallback={null}>
      <FamiliesLandingClient classic />
    </Suspense>
  );
}
