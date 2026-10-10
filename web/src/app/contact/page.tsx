import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-titles";
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
const BASE_METADATA: Metadata = {
  title: "Contact, Gadit",
  description: "Contact Gadit support.",
};

/** Same metadata, with the tab title in the visitor's UI language. */
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("contact", BASE_METADATA);
}

export default function ContactRoute() {
  return <ContactClient />;
}
