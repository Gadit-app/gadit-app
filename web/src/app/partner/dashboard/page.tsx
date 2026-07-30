import type { Metadata } from "next";
import { PartnerDashboardClient } from "./PartnerDashboardClient";

/**
 * /partner/dashboard?t=<token> — the native partner (affiliate) dashboard.
 *
 * No login: the `t` token from the welcome email is the credential. This
 * is the in-house alternative to the Affonso embed at /affiliate/dashboard
 * (both run in parallel for now).
 */
export const metadata: Metadata = {
  title: "Partner dashboard, Gadit",
  robots: { index: false, follow: false },
};

export default function PartnerDashboardRoute() {
  return <PartnerDashboardClient />;
}
