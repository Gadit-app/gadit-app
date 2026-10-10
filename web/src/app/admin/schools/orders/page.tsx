import type { Metadata } from "next";
import AdminSchoolOrdersClient from "./AdminSchoolOrdersClient";

// noindex: admin-only, never expose to search engines.
export const metadata: Metadata = {
  title: "Pilot requests",
  robots: { index: false, follow: false },
};

export default function AdminSchoolOrdersPage() {
  return <AdminSchoolOrdersClient />;
}
