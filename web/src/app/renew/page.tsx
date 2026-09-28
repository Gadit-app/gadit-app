import type { Metadata } from "next";
import { RenewClient } from "./RenewClient";

// A payment handoff page is never a search result.
export const metadata: Metadata = {
  title: "Renew | Gadit",
  robots: { index: false, follow: false },
};

export default function RenewPage() {
  return <RenewClient />;
}
