import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-titles";
import { PracticePage } from "./PracticeClient";

/**
 * /practice — spaced-repetition flashcard practice (Deep tier).
 *
 * Routed from the "Practice now" CTA on /notebook. Anonymous and
 * non-Deep users are bounced before any data is fetched. Indexed:
 * false (private user data + ephemeral practice state).
 */
const BASE_METADATA: Metadata = {
  title: "Practice, Gadit",
  robots: { index: false, follow: false },
};

/** Same metadata, with the tab title in the visitor's UI language. */
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("practice", BASE_METADATA);
}

export default function PracticeRoute() {
  return <PracticePage />;
}
