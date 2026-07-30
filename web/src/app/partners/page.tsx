import type { Metadata } from "next";
import { PartnersClient } from "./PartnersClient";

/**
 * /partners — the native partner (affiliate) program marketing + signup
 * page, modelled on yooniz.com/partners. Runs in parallel with the older
 * Affonso surface at /affiliates for now (Gadi 2026-07-30).
 */
export const metadata: Metadata = {
  title: "Partner Program, Gadit",
  description: "Recommend Gadit and earn recurring commission. 25% in year one, 10% for life.",
};

export default function PartnersRoute() {
  return <PartnersClient />;
}
