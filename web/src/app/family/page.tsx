import type { Metadata } from "next";
import { FamilyClient } from "./FamilyClient";

/**
 * /family — paying-owner-only dashboard that lists the family members,
 * lets the owner add new members, and surfaces device-pairing actions
 * (generate QR + 6-digit code). All gating happens inside the client
 * (loading auth + family doc).
 */
export const metadata: Metadata = {
  title: "Family, Gadit",
  robots: { index: false, follow: false },
};

export default function FamilyRoute() {
  return <FamilyClient />;
}
