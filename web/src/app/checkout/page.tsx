import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-titles";
import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

/**
 * /checkout — in-app payment page (Stripe Payment Element).
 *
 * Exists because Stripe's HOSTED Checkout has no Hebrew locale; this
 * page renders the Payment Element with locale "he" inside our own
 * chrome. Other languages keep using the hosted flow via
 * /api/create-checkout. Query params: ?price=<stripe price id>
 * (&code=<promo code>).
 *
 * noindex: a payment form is never a search result.
 */

const BASE_METADATA: Metadata = {
  title: "Checkout | Gadit",
  robots: { index: false, follow: false },
};

/** Same metadata, with the tab title in the visitor's UI language. */
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("checkout", BASE_METADATA);
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutClient />
    </Suspense>
  );
}
