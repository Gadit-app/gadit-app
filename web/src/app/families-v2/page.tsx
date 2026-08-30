import type { Metadata } from "next";
import { Suspense } from "react";
import FamiliesV2Client from "./FamiliesV2Client";

/**
 * /families-v2 — NON-LIVE preview of the redesigned Family landing.
 *
 * This route exists only so Gadi can review the new light, teal-only,
 * feature-by-feature redesign without touching the live /families page.
 * It is noindex (never a public/indexed duplicate). Once approved, the
 * new client replaces the live /families client and this route is removed.
 */

export const metadata: Metadata = {
  title: "Gadit for Families (preview)",
  robots: { index: false, follow: false },
};

export default function FamiliesV2Page() {
  return (
    <Suspense fallback={null}>
      <FamiliesV2Client withNav />
    </Suspense>
  );
}
