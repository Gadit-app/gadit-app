import type { Metadata } from "next";
import AdminSchoolsClient from "./AdminSchoolsClient";

// noindex: admin-only — never expose to search engines.
export const metadata: Metadata = {
  title: "Schools",
  robots: { index: false, follow: false },
};

export default function AdminSchoolsPage() {
  return <AdminSchoolsClient />;
}
