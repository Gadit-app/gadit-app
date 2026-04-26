import type { Metadata } from "next";
import { AccountPage } from "./AccountClient";

/**
 * /account — profile + subscription dashboard.
 *
 * Signed-in only (any tier). Anonymous users see the login modal.
 * Indexed: false — no value to search engines.
 */
export const metadata: Metadata = {
  title: "Account — Gadit",
  robots: { index: false, follow: false },
};

export default function AccountRoute() {
  return <AccountPage />;
}
