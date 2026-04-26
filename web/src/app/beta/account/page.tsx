import type { Metadata } from "next";
import { BetaAccountPage } from "./BetaAccountClient";

/**
 * /beta/account — V2 account dashboard.
 *
 * Signed-in only (any tier). Anonymous users see the login modal and
 * the page renders nothing until they auth. Robots-disallowed like
 * the rest of /beta.
 */
export const metadata: Metadata = {
  title: "Account — Gadit",
  robots: { index: false, follow: false },
};

export default function BetaAccount() {
  return <BetaAccountPage />;
}
