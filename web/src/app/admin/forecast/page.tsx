import type { Metadata } from "next";
import AdminForecastClient from "./AdminForecastClient";

export const metadata: Metadata = {
  title: "Cash flow",
  robots: { index: false, follow: false },
};

export default function AdminForecastPage() {
  return <AdminForecastClient />;
}
