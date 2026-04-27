import type { Metadata } from "next";
import { ContactClient } from "./ContactClient";

/**
 * /contact — minimal contact page reachable from the footer.
 *
 * No form (we don't want spam piped into Firestore). Just a clear
 * mailto: link to support@gadit.app and a localized "we'll respond
 * within 30 days" line. The original /contact route 404'd because
 * we never built it; beta security review caught the broken footer
 * link, hence this thin landing.
 */
export const metadata: Metadata = {
  title: "Contact — Gadit",
  description: "Contact Gadit support.",
};

export default function ContactRoute() {
  return <ContactClient />;
}
