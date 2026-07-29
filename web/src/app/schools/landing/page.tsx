import type { Metadata } from "next";
import { SchoolsLandingClient } from "../SchoolsLandingClient";

/**
 * /schools/landing — the STANDALONE Schools landing page, with NO site nav
 * (Gadi 2026-07-29). The link to send in a campaign so it reads as a single
 * product page. The in-site version (with nav) is at /schools.
 */
export const metadata: Metadata = {
  title: "Schools | Gadit",
  description:
    "See every word your class doesn't understand. Real-time dashboard, no student accounts, no IT setup. $69/month, 14 days free.",
  robots: { index: false, follow: false },
};

export default function SchoolsLandingRoute() {
  return <SchoolsLandingClient standalone />;
}
