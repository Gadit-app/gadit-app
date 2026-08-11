import type { Metadata } from "next";
import AdminReportsClient from "./AdminReportsClient";

// noindex: this is admin-only — never expose to search engines.
export const metadata: Metadata = {
  title: "Reports",
  robots: { index: false, follow: false },
};

export default function AdminReportsPage() {
  return <AdminReportsClient />;
}
