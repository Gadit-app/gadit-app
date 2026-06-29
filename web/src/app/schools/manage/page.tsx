import type { Metadata } from "next";
import { SchoolsClient } from "../SchoolsClient";

/**
 * /schools/manage — paying-owner-only dashboard for the Schools
 * subscription. Lives here (not at /schools) because /schools is now
 * the public marketing landing page; the dashboard moved to /manage
 * to keep the landing URL clean for SEO and cold outreach.
 *
 * Anonymous and non-school visitors who land here get the same gate
 * the client renders (a soft "you need Schools to manage classrooms"
 * message with a link back to /pricing).
 */
export const metadata: Metadata = {
  title: "Schools, Gadit",
  robots: { index: false, follow: false },
};

export default function SchoolsManageRoute() {
  return <SchoolsClient />;
}
