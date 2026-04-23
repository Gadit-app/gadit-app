import type { Metadata } from "next";
import AdminReportsClient from "./AdminReportsClient";

// noindex: this is admin-only — never expose to search engines.
export const metadata: Metadata = {
  title: "Reports — Gadit Admin",
  robots: { index: false, follow: false },
};

export default function AdminReportsPage() {
  return <AdminReportsClient />;
}
