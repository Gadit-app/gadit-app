import type { Metadata } from "next";
import { Suspense } from "react";
import DoneClient from "./DoneClient";

/**
 * /checkout/done — Stripe return_url target for the in-app Payment
 * Element flow. Reads redirect_status from the query and routes the
 * user to the right home (family/schools/general). Account
 * provisioning itself happens in the webhook, not here.
 */

export const metadata: Metadata = {
  title: "Checkout | Gadit",
  robots: { index: false, follow: false },
};

export default function CheckoutDonePage() {
  return (
    <Suspense fallback={null}>
      <DoneClient />
    </Suspense>
  );
}
