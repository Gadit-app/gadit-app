import type { Metadata } from "next";
import { SchoolsClient } from "./SchoolsClient";

/**
 * /schools — paying-owner-only dashboard for the Schools subscription.
 * Mirrors /family in shape: lists classrooms, lets the principal add new
 * ones, edit the school name + logo. All gating happens inside the client
 * (loading auth + school doc).
 */
export const metadata: Metadata = {
  title: "Schools, Gadit",
  robots: { index: false, follow: false },
};

export default function SchoolsRoute() {
  return <SchoolsClient />;
}
