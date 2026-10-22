import type { Metadata } from "next";
import AdminLearnReportsClient from "./AdminLearnReportsClient";

// noindex: admin only, never for search engines.
export const metadata: Metadata = {
  title: "Learning word reports",
  robots: { index: false, follow: false },
};

export default function AdminLearnReportsPage() {
  return <AdminLearnReportsClient />;
}
