import type { Metadata } from "next";
import { SchoolOrderClient } from "./SchoolOrderClient";

/**
 * /schools/order — school registration / order form. Israeli schools buy a
 * full year up front by bank transfer / PO, so there is no checkout: the
 * school registers here, we open the account and send a tax invoice.
 */
export const metadata: Metadata = {
  title: "Register your school, Gadit",
  description: "Register your school for Gadit. We open your account and send a tax invoice; pay annually by bank transfer.",
  robots: { index: false, follow: false },
};

export default function SchoolOrderRoute() {
  return <SchoolOrderClient />;
}
